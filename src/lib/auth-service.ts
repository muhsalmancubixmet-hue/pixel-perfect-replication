import { apiClient } from "./api-client";

export interface LoginPlayLoad {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_staff: boolean;
    profile_id: string | null;
  };
}

export const authService = {
  async Login(credentials: LoginPlayLoad): Promise<AuthTokens> {
    // Enforce admin portal identifier in request payload and headers
    const response = await apiClient.post<AuthTokens>(
      "/auth/token/",
      {
        ...credentials,
        portal: "admin",
      },
      {
        headers: {
          "X-Target-Portal": "admin",
        },
      },
    );
    const { access, refresh, user } = response.data;

    // Parse claims directly from access token to enforce RBAC tenant boundaries
    let isStaff = false;
    let userRole = "Admin";
    let userEmail = credentials.email;
    let userName = credentials.email.split("@")[0];

    try {
      const tokenPart = access.split(".")[1];
      if (tokenPart) {
        const payload = JSON.parse(atob(tokenPart));
        userEmail = payload.email || credentials.email;
        userName =
          payload.name ||
          payload.username ||
          (user ? `${user.first_name} ${user.last_name}`.trim() : "") ||
          userEmail.split("@")[0];
        isStaff = Boolean(
          payload.is_staff ||
          payload.is_superuser ||
          payload.role === "STAFF" ||
          payload.role === "SUPER_ADMIN",
        );
        userRole = payload.is_superuser ? "Super Admin" : payload.role || "Admin";
      }
    } catch {
      isStaff = Boolean(user?.is_staff);
    }

    if (user && user.is_staff) {
      isStaff = true;
    }

    // Immediately reject non-staff users (e.g. influencers/creators)
    if (!isStaff) {
      this.LogOut();
      throw new Error(
        "Access forbidden: Influencer and creator accounts cannot access the administration control panel. Please sign in via the Creator Hub.",
      );
    }

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    const session = {
      name: userName,
      email: userEmail,
      role: userRole,
      mfa: true,
    };
    localStorage.setItem("ic_admin_session", JSON.stringify(session));

    return response.data;
  },

  LogOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("ic_admin_session");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("access_token");
    if (!token) return false;

    try {
      const tokenPart = token.split(".")[1];
      if (!tokenPart) {
        this.LogOut();
        return false;
      }
      const payload = JSON.parse(atob(tokenPart));

      // Token expiration check
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.LogOut();
        return false;
      }

      // Strictly verify staff clearance
      const isStaff = Boolean(
        payload.is_staff ||
        payload.is_superuser ||
        payload.role === "STAFF" ||
        payload.role === "SUPER_ADMIN",
      );

      if (!isStaff) {
        this.LogOut();
        return false;
      }

      return true;
    } catch {
      this.LogOut();
      return false;
    }
  },
};

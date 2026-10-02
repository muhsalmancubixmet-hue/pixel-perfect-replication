/** Prototype-only staff session stored in localStorage. Replace with Django auth later. */
export const SESSION_KEY = "ic_admin_session";

export interface StaffSession {
  name: string;
  email: string;
  role: string;
  mfa: boolean;
}

export const DEMO_SESSION: StaffSession = {
  name: "Mohammed Fadhil",
  email: "fadhil@influencers.com",
  role: "Super Admin",
  mfa: true,
};

export function getSession(): StaffSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StaffSession) : null;
  } catch {
    return null;
  }
}

export function setSession(s: StaffSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export const PUBLIC_PATHS = ["/login", "/mfa/verify", "/invite/accept"];

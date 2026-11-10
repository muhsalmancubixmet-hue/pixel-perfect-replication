import { apiClient } from "./api-client";


export interface LoginPlayLoad {
    email:string;
    password:string;
}

export interface AuthTokens{
    access:string;
    refresh:string;
}


export const authService = {
    async Login(credentials: LoginPlayLoad): Promise<AuthTokens> {
        const response = await apiClient.post<AuthTokens>('/auth/token/', credentials);
        const { access, refresh } = response.data;


        localStorage.setItem('access_token',access);
        localStorage.setItem('refresh_token', refresh);

        return response.data;
    },
    LogOut(){
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }
}
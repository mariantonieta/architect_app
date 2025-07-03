
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = "http://localhost:8000";

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

//api.interceptors.response.use
type RegisterRequestData = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: "customer" | "supplier" | "architect";
    phone?: string;
    address?: string;
    entity_type?: string;
    company?: string,

}

export const authService = {
    async login(email: string, password: string) {
        const params = new URLSearchParams();
        params.append("username", email);
        params.append("password", password);

        const response = await api.post("/auth/login", params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        return response.data;
    },

    async register(data: RegisterRequestData) {
        return api.post("/users/register", data);
    },


    async getUserById(userId: string) {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    }
};
export default api;

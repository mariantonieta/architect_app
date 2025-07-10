import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = "http://localhost:8000";

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        //   "Content-Type": "application/json",
        Accept: "application/json",
    },
});
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

export default api;

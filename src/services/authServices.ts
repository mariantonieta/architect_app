import api from "./api";

type RegisterRequestData = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: "customer" | "supplier" | "architect";
    phone?: string;
    address?: string;
    entity_type?: string;
    company?: string;
};

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
        const response = await api.post("/users/register", data);
        return response.data;
    },

    async recoverPassword(email: string) {
        const response = await api.post(`/auth/password-recovery/${email}`);
        return response.data;
    },

    async resetPassword(data: { token: string; new_password: string; confirm_password: string }) {
        const response = await api.post("/auth/reset-password/", data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    },

    async completeGoogleRegistration(data: Record<string, string>) {
        const params = new URLSearchParams();
        for (const key in data) {
            if (data[key]) {
                params.append(key, data[key]);
            }
        }

        const response = await api.post("/auth/google/complete-registration", params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        return response.data;
    },
};

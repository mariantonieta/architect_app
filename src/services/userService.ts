import api from "./api";

type UserUpdateData = Partial<{
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    address?: string;
    entity_type?: string;
    company?: string;
}>;

export const userService = {
    async getUserById(userId: string) {
        const response = await api.get(`/users/${userId}`);
        console.log("Respuesta del backend:", response);
        return response.data;
    },

    async updateUser(userId: string, data: UserUpdateData) {
        const response = await api.patch(`/users/${userId}`, data, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        return response.data;
    },

    async deleteUser(userId: string) {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

};

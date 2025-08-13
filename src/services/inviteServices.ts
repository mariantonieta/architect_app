import api from "./api";

export type User = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_completed: boolean;
    role_id: string;
    role_name: string;
    entity_type?: string;
    company?: string;
    phone?: string;
    address?: string;
};

export type Invitation = {
    id: string;
    email: string;
    status: string;
    invited_at: string;
    invited_by_id?: number | null;
    user?: User;
};

export type RoleType = "supplier" | "customer" | "architect";

export const inviteService = {
    async inviteUserByRole(
        email: string,
        role: RoleType,
        options?: { inviter_name?: string; project_name?: string; project_id?: string }
    ) {
        const payload = {
            email,
            ...options,
        };

        const response = await api.post(`/invite/${role}`, payload, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        return response.data;
    },
    async getInvitationsByRole(role: RoleType): Promise<Invitation[]> {
        const response = await api.get("/invitations", {
            params: { role },
        });
        return response.data;
    },

    async searchInvitationByEmailAndRole(email: string, role: RoleType): Promise<string[]> {
        const response = await api.get("/invitations/search", {
            params: { email, role },
        });
        return response.data;
    },

    async deleteInvitation(invitationId: string) {
        await api.delete(`/invitation/${invitationId}`);
    },

    async updateInvitation(invitationId: string, data: { email?: string; status?: string }) {
        const response = await api.patch(`/invitation/${invitationId}`, data);
        return response.data;
    },

    async getInvitationStatus(email: string): Promise<Invitation> {
        const response = await api.get(`/invitation/status/${email}`);
        return response.data;
    },
    async inviteAgendaUser(
        email: string,
        role: RoleType,
        options?: { inviter_name?: string }
    ) {
        const payload = {
            email,
            ...options,
        };

        const response = await api.post(`/invitationsagenda/${role}`, payload, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        return response.data;
    }

};
export async function searchSuppliers(query: string): Promise<User[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    // Esto devuelve un array de strings (emails)
    const emails = await inviteService.searchInvitationByEmailAndRole(query, "supplier");

    // Lo convertimos a User[] básico
    return emails.map((email) => ({
        id: email, // si no hay ID real, usamos el email como ID temporal
        email,
        first_name: "",
        last_name: "",
        is_completed: false,
        role_id: "supplier",
        role_name: "supplier",
    }));
}

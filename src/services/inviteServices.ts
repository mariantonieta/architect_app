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

export type InviteSupplierData = {
    email: string;
};
export type InviteArchitectData = {
    email: string;
};
export const inviteService = {
    async inviteSupplier(data: InviteSupplierData) {
        const response = await api.post("/invite/supplier", data, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        return response.data;
    },

    async getSupplierInvitations(): Promise<Invitation[]> {
        const response = await api.get("/invitations/suppliers");
        return response.data;
    },
    async searchInvitationByEmail(email: string, role: 'customer' | 'supplier' | 'architect') {
        const response = await api.get(`/invitations/search`, {
            params: { email, role }
        });
        return response.data;
    },

    async inviteCustomer(data: { email: string }) {
        const response = await api.post(`/invite/customer`, data);
        return response.data;

    },
    async getCustomerInvitations(): Promise<Invitation[]> {

        const response = await api.get("/invitations", {
            params: { role: "customer" },
        });
        return response.data;
    },
    async deleteInvitation(invitationId: string) {
        await api.delete(`/invitation/${invitationId}`);
    },
    async inviteArchitect(data: InviteArchitectData) {
        const response = await api.post("/invite/architect", data, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        return response.data;
    },

    async getArchitectInvitations(): Promise<Invitation[]> {
        const response = await api.get("/invitations", {
            params: { role: "architect" },
        });
        return response.data;
    },
};

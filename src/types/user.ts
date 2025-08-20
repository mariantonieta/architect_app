export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    entity_type?: string;
    phone?: string;
    company?: string;
    address?: string;
    is_completed?: boolean;
}

export function normalizeUser(userData: any): User {
    return {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        role: userData.role || userData.role_name || "unknown",
        entity_type: userData.entity_type || "",
        phone: userData.phone || "",
        company: userData.company || "",
        address: userData.address || "",
        is_completed: userData.is_completed ?? false,
    };
}


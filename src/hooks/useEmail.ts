// hooks/useEmail.ts
import { useCallback } from "react";
import { inviteService } from "@/services/inviteServices";

export const useEmail = () => {
    const useRoleInvitationHandlers = useCallback((role: "architect" | "customer" | "supplier") => {
        const handleEmailAdd = useCallback(async (email: string) => {
            try {
                const res = await inviteService.searchInvitationByEmailAndRole(email, role);
                const alreadyExists = res.some(
                    (existingEmail) => existingEmail.toLowerCase() === email.toLowerCase()
                );
                return !alreadyExists;
            } catch (error) {
                console.error("Error adding email:", error);
                return false;
            }
        }, [role]);

        const handleSearch = useCallback(async (query: string) => {
            try {
                const res = await inviteService.searchInvitationByEmailAndRole(query, role);
                return res;
            } catch (error) {
                console.error("Error searching emails:", error);
                return [];
            }
        }, [role]);

        return { handleEmailAdd, handleSearch };
    }, []);

    const { handleEmailAdd: handleArchitectAdd, handleSearch: searchArchitect } =
        useRoleInvitationHandlers("architect");

    const { handleEmailAdd: handleCustomerAdd, handleSearch: searchCustomer } =
        useRoleInvitationHandlers("customer");

    const { handleEmailAdd: handleSupplierAdd, handleSearch: searchSupplier } =
        useRoleInvitationHandlers("supplier");

    return {
        emailHandlers: {
            handleArchitectAdd,
            searchArchitect,
            handleCustomerAdd,
            searchCustomer,
            handleSupplierAdd,
            searchSupplier,
        },
    };
};
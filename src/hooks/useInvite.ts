import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteService } from '../services/inviteServices';
import type { Invitation, InviteSupplierData } from '../services/inviteServices';

export function useSupplierInvitations() {
    return useQuery<Invitation[], Error>({
        queryKey: ['supplierInvitations'],
        queryFn: () => inviteService.getSupplierInvitations(),
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
    });
}

export function useInviteSupplier() {
    const queryClient = useQueryClient();

    return useMutation<any, Error, InviteSupplierData>({
        mutationFn: (data) => inviteService.inviteSupplier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplierInvitations'] });
        },
    });
}
export function useDeleteInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (invitationId: string) => inviteService.deleteInvitation(invitationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplierInvitations'] });
        },
    });
}
export function useSearchCustomerInvitation() {
    return useMutation({
        mutationFn: (email: string) => inviteService.searchInvitationByEmail(email, 'customer'),
    });
}

export function useInviteCustomer() {
    return useMutation({
        mutationFn: (data: { email: string }) => inviteService.inviteCustomer(data),
    });
}
export function useArchitectInvitations() {
    return useQuery<Invitation[], Error>({
        queryKey: ['architectInvitations'],
        queryFn: () => inviteService.getArchitectInvitations(),
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
    });
}


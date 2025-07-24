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

export function useCustomerInvitations() {
    return useQuery<Invitation[], Error>({
        queryKey: ['customerInvitations'],
        queryFn: () => inviteService.getCustomerInvitations(),
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
    });
}

export function useInviteCustomer() {
    const queryClient = useQueryClient();

    return useMutation<any, Error, { email: string }>({
        mutationFn: (data) => inviteService.inviteCustomer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customerInvitations'] });
        },
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

export function useInviteArchitect() {
    const queryClient = useQueryClient();

    return useMutation<any, Error, { email: string }>({
        mutationFn: (data) => inviteService.inviteArchitect(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['architectInvitations'] });
        },
    });
}

export function useDeleteInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (invitationId: string) => inviteService.deleteInvitation(invitationId),
        onSuccess: () => {

            queryClient.invalidateQueries({ queryKey: ['supplierInvitations'] });
            queryClient.invalidateQueries({ queryKey: ['customerInvitations'] });
            queryClient.invalidateQueries({ queryKey: ['architectInvitations'] });
        },
    });
}

export function useSearchInvitation(role: 'customer' | 'supplier' | 'architect') {
    return useMutation({
        mutationFn: (email: string) => inviteService.searchInvitationByEmail(email, role),
    });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteService } from '../services/inviteServices';
import type { Invitation, RoleType } from '../services/inviteServices';

export function useInvitations(role: RoleType) {
    return useQuery<Invitation[], Error>({
        queryKey: ['invitations', role],
        queryFn: () => inviteService.getInvitationsByRole(role),
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
    });
}
export function useInviteUser(role: RoleType) {
    const queryClient = useQueryClient();

    return useMutation<
        void,
        Error,
        {
            emails: string[];
            inviter_name?: string;
            project_name?: string;
            project_id?: string;
        }
    >({
        mutationFn: async ({ emails, inviter_name, project_name, project_id }) => {
            await Promise.all(
                emails.map((email) =>
                    inviteService.inviteUserByRole(email, role, {
                        inviter_name,
                        project_name,
                        project_id,
                    })
                )
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invitations', role] });
        },
    });
}
export function useDeleteInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (invitationId: string) => inviteService.deleteInvitation(invitationId),
        onSuccess: () => {
            ['supplier', 'customer', 'architect'].forEach((role) => {
                queryClient.invalidateQueries({ queryKey: ['invitations', role] });
            });
        },
    });
}

export function useSearchInvitation(email: string, role: RoleType) {
    return useQuery({
        queryKey: ['searchInvitation', email, role],
        queryFn: () => inviteService.searchInvitationByEmailAndRole(email, role),
        enabled: email.length > 0,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

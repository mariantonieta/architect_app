import { useState } from "react";
import { useInvitations, useInviteUser } from "@/hooks/useInvite";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InviteModal } from "@/components/invite-modal";
import { Agenda } from "@/components/agenda";
import { useUser } from "@/hooks/useUser";

type RoleName = "supplier" | "customer" | "architect";

type Invitation = {
  id: string;
  email: string;
  status: string;
  user?: {
    first_name: string;
    last_name: string;
    role_name?: RoleName;
    address?: string;
    phone?: string;
    company?: string;
  };
};
function mapInvitations(rawInvitations: any[] | undefined): Invitation[] | undefined {
  if (!rawInvitations) return undefined;
  const validRoles: RoleName[] = ["supplier", "customer", "architect"];

  return rawInvitations.map((inv) => {
    const userRole = inv.user?.role_name;
    return {
      ...inv,
      user: inv.user
        ? {
            ...inv.user,
            role_name: validRoles.includes(userRole) ? userRole : undefined,
          }
        : undefined,
    };
  });
}

export default function CustomerAgenda() {
  const role = "customer";

  const { data: rawData, isLoading, isError } = useInvitations(role);
  const { mutate: inviteCustomer } = useInviteUser(role);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const { data: currentUser, isLoading: userLoading, isError: userError } = useUser();
  const inviter_name = currentUser?.first_name || "Inviter";
  const data = mapInvitations(rawData);

  const inviteFn = (
    emails: string[],
    { onSuccess, onError }: { onSuccess: (data: any) => void; onError: (error: any) => void }
  ) => {
    if (!currentUser) {
      onError(new Error("Current user not loaded"));
      return;
    }
    Promise.all(
      emails.map(
        (email) =>
          new Promise<void>((resolve, reject) => {
            inviteCustomer(
              { email, inviter_name },
              {
                onSuccess: () => resolve(),
                onError: (err) => reject(err),
              }
            );
          })
      )
    )
      .then(() => onSuccess({ msg: "All invitations sent." }))
      .catch(onError);
  };

  if (userLoading) return <p>Loading user...</p>;
  if (userError) return <p>Error loading user.</p>;

  return (
    <>
      <InviteModal
        open={openInviteModal}
        setOpen={setOpenInviteModal}
        title="Invite Customer"
        placeholder="customer@email.com"
        buttonText="Send Invitations"
        inviteFn={inviteFn}
        role="customer"
      />

      <Agenda
        title="Customer Agenda"
        description="Manage your contacts and appointments with customers"
        invitations={data}
        isLoading={isLoading}
        isError={isError}
        onOpenInviteModal={() => setOpenInviteModal(true)}
        InviteModalComponent={
          <Button
            className="bg-gray-800 hover:bg-gray-700 text-white"
            onClick={() => setOpenInviteModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        }
      />
    </>
  );
}

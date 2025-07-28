import { useState } from "react";
import { useInvitations, useInviteUser } from "@/hooks/useInvite";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InviteModal } from "@/components/invite-modal";
import { Agenda } from "@/components/agenda";

export default function CustomerAgenda() {
  const role = "customer";

  const { data, isLoading, isError } = useInvitations(role);
  const { mutate: inviteCustomer } = useInviteUser(role);
  const [openInviteModal, setOpenInviteModal] = useState(false);

  const inviteFn = (
    emails: string[],
    { onSuccess, onError }: { onSuccess: (data: any) => void; onError: (error: any) => void }
  ) => {
    Promise.all(
      emails.map(
        (email) =>
          new Promise<void>((resolve, reject) => {
            inviteCustomer(
              { email },
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

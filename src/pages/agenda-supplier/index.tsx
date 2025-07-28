import { useState } from "react";
import { useInvitations, useInviteUser } from "@/hooks/useInvite";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InviteModal } from "@/components/invite-modal";
import { Agenda } from "@/components/agenda";

export default function SupplierAgenda() {
  const role = "supplier";

  const { data, isLoading, isError } = useInvitations(role);
  const { mutate: inviteSupplier } = useInviteUser(role);
  const [openInviteModal, setOpenInviteModal] = useState(false);

  const inviteFn = (
    emails: string[],
    { onSuccess, onError }: { onSuccess: (data: any) => void; onError: (error: any) => void }
  ) => {
    Promise.all(
      emails.map(
        (email) =>
          new Promise<void>((resolve, reject) => {
            inviteSupplier(
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
        title="Invite Supplier"
        placeholder="supplier@email.com"
        buttonText="Send Invitations"
        inviteFn={inviteFn}
        role={role}
      />

      <Agenda
        title="Supplier Agenda"
        description="Manage your contacts and appointments with suppliers"
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
            New Supplier
          </Button>
        }
      />
    </>
  );
}

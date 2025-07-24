import { useState } from "react";
import { useCustomerInvitations, useInviteCustomer } from "@/hooks/useInvite";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InviteModal } from "@/components/invite-modal";
import { Agenda } from "@/components/agenda";

export default function CustomerAgenda() {
  const { data, isLoading, isError } = useCustomerInvitations();
  const { mutate: inviteCustomer } = useInviteCustomer();
  const [openInviteModal, setOpenInviteModal] = useState(false);

  const inviteFn = (email: string, { onSuccess, onError }: any) => {
    inviteCustomer(
      { email },
      {
        onSuccess,
        onError,
      }
    );
  };

  return (
    <>
      <InviteModal
        open={openInviteModal}
        setOpen={setOpenInviteModal}
        title="Invite Customer"
        placeholder="customer@email.com"
        buttonText="Send Invitation"
        inviteFn={inviteFn}
      />

      <Agenda
        title="Customer Agenda"
        description="Manage your contacts and appointments with customer"
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

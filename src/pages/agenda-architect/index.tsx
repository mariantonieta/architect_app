import { useState } from "react";
import {
  useArchitectInvitations,

  useInviteArchitect,

} from "@/hooks/useInvite";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InviteModal } from "@/components/invite-modal"; 
import { Agenda } from "@/components/agenda";

export default function ArchitectAgenda() {
  const { data, isLoading, isError } = useArchitectInvitations();
  const { mutate: inviteArchitect } = useInviteArchitect();
  const [openInviteModal, setOpenInviteModal] = useState(false);

  const inviteFn = (email: string, { onSuccess, onError }: any) => {
    inviteArchitect(
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
        title="Invite Architect"
        placeholder="architect@email.com"
        buttonText="Send Invitation"
        inviteFn={inviteFn}
      />

      <Agenda
        title="Architect Agenda"
        description="Manage your contacts and appointments with architect"
        invitations={data}
        isLoading={isLoading}
        isError={isError}
        onOpenInviteModal={() => setOpenInviteModal(true)}
        InviteModalComponent={
          <Button className="bg-gray-800 hover:bg-gray-700 text-white" onClick={() => setOpenInviteModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Architect
          </Button>
        }
      />
    </>
  );
}

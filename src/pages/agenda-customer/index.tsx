import { useState } from "react";
import { useInvitations, useInviteAgendaUser } from "@/hooks/useInvite";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InviteModal } from "@/components/invite-modal";
import { Agenda } from "@/components/agenda";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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

function mapInvitations(
  rawInvitations: any[] | undefined
): Invitation[] | undefined {
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
  const { t } = useTranslation();
  const { data: rawData, isLoading, isError } = useInvitations(role);
  const { mutate: inviteCustomer } = useInviteAgendaUser(role);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const {
    data: currentUser,
    isLoading: userLoading,
    isError: userError,
  } = useUser();
  const inviter_name = currentUser?.first_name || "Inviter";
  const data = mapInvitations(rawData);

  const inviteFn = (
    emails: string[],
    {
      onSuccess,
      onError,
    }: { onSuccess: (data: any) => void; onError: (error: any) => void }
  ) => {
    if (!currentUser) {
      const err = new Error("Current user not loaded");
      toast.error(err.message);
      onError(err);
      return;
    }

    inviteCustomer(
      {
        emails,
        inviter_name,
      },
      {
        onSuccess: () => {
          toast.success(t("common.invitationSent"));
          setOpenInviteModal(false);
          window.location.reload();
        },
        onError: (err) => {
          toast.error(t("errors.failedInvitation"));
          onError(err);
        },
      }
    );
  };

  if (userLoading) return <p>{t("common.loading")}</p>;
  if (userError) return <p>{t("errors.notLoaded")}</p>;

  return (
    <>
      <InviteModal
        open={openInviteModal}
        setOpen={setOpenInviteModal}
        title={t("agenda.inviteCustomer")}
        placeholder="customer@email.com"
        buttonText={t("agenda.sendInvitations")}
        inviteFn={inviteFn}
        role={role}
      />

      <Agenda
        title={t("agenda.agendaCustomer")}
        description={t("agenda.manageContacts")}
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
            {t("agenda.newCustomer")}
          </Button>
        }
      />
    </>
  );
}

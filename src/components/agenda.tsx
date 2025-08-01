import { InvitationsCard } from "@/components/invitations-card";

type Invitation = {
  id: string;
  email: string;
  status: string;
  user?: {
    first_name: string;
    last_name: string;
    role_name?: "architect" | "supplier" | "customer";
    address?: string;
    phone?: string;
    company?: string;
  };
};

type AgendaProps = {
  title: string;
  description: string;
  invitations: Invitation[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onOpenInviteModal: () => void;
  InviteModalComponent: React.ReactNode;
};

export function Agenda({
  title,
  description,
  invitations,
  isLoading,
  isError,
  onOpenInviteModal,
  InviteModalComponent,
}: AgendaProps) {
  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError) return <div className="p-6 text-red-500">Error loading data</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            {InviteModalComponent && (
              <div onClick={onOpenInviteModal}>{InviteModalComponent}</div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations?.map((inv) => {
              const role = inv.user?.role_name;

              const name = inv.user
                ? `${inv.user.first_name} ${inv.user.last_name}`
                : "Invited";

              const commonProps = {
                key: inv.id,
                id: inv.id,
                name,
                email: inv.email,
                status: inv.status as "Active" | "Pending" | "Cancelled",
              };

              if (role === "architect") {
                return (
                  <InvitationsCard
                    {...commonProps}
                    
                
                
                  />
                );
              }

              if (role === "supplier") {
                return (
                  <InvitationsCard
                    {...commonProps}
                    phone={inv.user?.phone || "Unknown"}
                    location={inv.user?.address || "Unknown"}
                    company={inv.user?.company || "Unknown"}
                  />
                );
              }

              if (role === "customer") {
                return (
                  <InvitationsCard
                    {...commonProps}
                    phone={inv.user?.phone || "Unknown"}
                    location={inv.user?.address || "Unknown"}
                  />
                );
              }
              return (
                <InvitationsCard
                  {...commonProps}
                  phone={inv.user?.phone || "Unknown"}
                  location={inv.user?.address || "Unknown"}
                  company={inv.user?.company || "Unknown"}
                />
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

import { SupplierCard } from "@/components/supplier-card"


type Invitation = {
  id: string;
  email: string;
  status: string;
  user?: {
    first_name: string;
    last_name: string;
    role_name?: string;
    address?: string;
    phone?: string;
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
              <div onClick={onOpenInviteModal}>
                {InviteModalComponent}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations?.map((inv, index) => (
              <SupplierCard
                key={index}
                id={inv.id}
                name={
                  inv.user
                    ? `${inv.user.first_name} ${inv.user.last_name}`
                    : "Invited"
                }
                category={inv.user?.role_name || "Unassigned"}
                location={inv.user?.address || "Unknown"}
                phone={inv.user?.phone || "Unknown"}
                email={inv.email}
                nextAppointment={"--"}
                status={inv.status as "Active" | "Pending" | "Cancelled"}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

import { useForm, Controller } from "react-hook-form";
import { EmailSelector } from "@/components/email-selector";
import { FormField } from "@/components/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useInviteUser } from "@/hooks/useInvite"; 
import { inviteService } from "@/services/inviteServices"; 

type RoleType = "architect" | "customer" | "supplier";

interface Project {
  id: string;
  name: string;
}

interface ShareProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

export default function ShareProjectModal({
  open,
  onOpenChange,
  project,
}: ShareProjectModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      architectEmail: [],
      customerEmail: [],
      supplierEmail: [],
    },
  });

  const inviteArchitect = useInviteUser("architect");
  const inviteCustomer = useInviteUser("customer");
  const inviteSupplier = useInviteUser("supplier");

  const onSubmit = async (data: any) => {
    try {
      const invites = [
        ...data.architectEmail.map((email: string) => ({ email, role: "architect" })),
        ...data.customerEmail.map((email: string) => ({ email, role: "customer" })),
        ...data.supplierEmail.map((email: string) => ({ email, role: "supplier" })),
      ];

      for (const { email, role } of invites) {
        const existing = await inviteService.searchInvitationByEmailAndRole(email, role);
        const alreadyInvited = existing.some(
          (e: string) => e.toLowerCase() === email.toLowerCase()
        );

        if (!alreadyInvited) {
          if (role === "architect") await inviteArchitect.mutateAsync({ email });
          if (role === "customer") await inviteCustomer.mutateAsync({ email });
          if (role === "supplier") await inviteSupplier.mutateAsync({ email });
        }
      }

      console.log(`Proyecto compartido con:`, invites);
      onOpenChange(false);
    } catch (error) {
      console.error("Error al enviar invitaciones:", error);
      // Podés mostrar un toast o alerta
    }
  };

  const handleSearch = async (query: string, role: RoleType) => {
    try {
      const res = await inviteService.searchInvitationByEmailAndRole(query, role);
      return res;
    } catch (error) {
      console.error("Error buscando emails:", error);
      return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Share project: {project?.name ?? "Sin proyecto seleccionado"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">

          <FormField label="Architect Email" id="architectEmail" error={errors.architectEmail?.message}>
            <Controller
              control={control}
              name="architectEmail"
              rules={{
                validate: (emails: string[]) => {
                  if (!Array.isArray(emails) || emails.length === 0) return true;
                  const invalids = emails.filter(
                    (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  );
                  return invalids.length === 0 || `Invalid emails: ${invalids.join(", ")}`;
                },
              }}
              render={({ field }) => (
                <EmailSelector
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Enter architect email and press Enter"
                  role="architect"
                  onSearch={(query) => handleSearch(query, "architect")}
                  onEmailAdd={() => true} // no hace nada
                />
              )}
            />
          </FormField>

          <FormField label="Customer Email" id="customerEmail" error={errors.customerEmail?.message}>
            <Controller
              control={control}
              name="customerEmail"
              rules={{
                validate: (emails: string[]) => {
                  if (!Array.isArray(emails) || emails.length === 0) return true;
                  const invalids = emails.filter(
                    (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  );
                  return invalids.length === 0 || `Invalid emails: ${invalids.join(", ")}`;
                },
              }}
              render={({ field }) => (
                <EmailSelector
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Enter customer email and press Enter"
                  role="customer"
                  onSearch={(query) => handleSearch(query, "customer")}
                  onEmailAdd={() => true}
                />
              )}
            />
          </FormField>

          <FormField label="Supplier Email" id="supplierEmail" error={errors.supplierEmail?.message}>
            <Controller
              control={control}
              name="supplierEmail"
              rules={{
                validate: (emails: string[]) => {
                  if (!Array.isArray(emails) || emails.length === 0) return true;
                  const invalids = emails.filter(
                    (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  );
                  return invalids.length === 0 || `Invalid emails: ${invalids.join(", ")}`;
                },
              }}
              render={({ field }) => (
                <EmailSelector
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Enter supplier email and press Enter"
                  role="supplier"
                  onSearch={(query) => handleSearch(query, "supplier")}
                  onEmailAdd={() => true}
                />
              )}
            />
          </FormField>

          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gray-800 text-white hover:bg-gray-700">
              Share
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

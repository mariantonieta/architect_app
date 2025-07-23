import { useState, cloneElement } from "react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useInviteSupplier } from "@/hooks/useInvite";

interface InviteSupplierModalProps {
  children: ReactNode;
}

export function InviteSupplierModal({ children }: InviteSupplierModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const {mutate: inviteSupplier} = useInviteSupplier();
const handleInvite = () => {
  if (!email) return;

  inviteSupplier(
    { email },
    {
      onSuccess: (data) => {
        toast(data.msg || "The invitation was successfully sent.");
        setEmail("");
        setOpen(false);
      },
      onError: (err: any) => {
        toast(err.message || "Something went wrong");
      },
    }
  );
};
  const trigger = children && cloneElement(children as any, { onClick: () => setOpen(true) });

  return (
    <>
      {trigger}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Supplier</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Label htmlFor="email">Supplier's Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="supplier@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleInvite} disabled={loading || !email}>
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      
    </>
  );
}

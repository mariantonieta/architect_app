import { useState } from "react";
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

interface InviteModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title?: string;
  placeholder?: string;
  buttonText?: string;
  inviteFn: (
    email: string,
    callbacks: {
      onSuccess: (data: any) => void;
      onError: (error: any) => void;
    }
  ) => void;
}

export function InviteModal({
  open,
  setOpen,
  title = "Invite",
  placeholder = "email@example.com",
  buttonText = "Send Invitation",
  inviteFn,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = () => {
    if (!email) return;

    setLoading(true);
    inviteFn(email, {
      onSuccess: (data) => {
        toast(data.msg || "The invitation was successfully sent.");
        setEmail("");
        setOpen(false);
        setLoading(false);
      },
      onError: (err: any) => {
        toast(err.message || "Something went wrong");
        setLoading(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Label htmlFor="email">{title} Email</Label>
          <Input
            id="email"
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleInvite} disabled={loading || !email}>
            {loading ? "Sending..." : buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

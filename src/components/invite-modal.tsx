import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { EmailSelector } from "@/components/email-selector";

interface InviteModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title?: string;
  placeholder?: string;
  buttonText?: string;
  role: "customer" | "supplier" | "architect";
  inviteFn: (
    emails: string[],
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
  buttonText = "Send Invitations",
  role,
  inviteFn,
}: InviteModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = () => {
    if (!emails.length) return;

    setLoading(true);
    inviteFn(emails, {
      onSuccess: (data) => {
        toast(data.msg || "Invitations sent.");
        setEmails([]);
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
          <Label>{title} Email</Label>
          <EmailSelector
            value={emails}
            onChange={setEmails}
            placeholder={placeholder}
            role={role}
            onEmailAdd={() => true}
        
          />
        </div>

        <DialogFooter>
          <Button onClick={handleInvite} disabled={loading || !emails.length}>
            {loading ? "Sending..." : buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

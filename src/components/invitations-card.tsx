import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Trash2 } from "lucide-react";
import { useDeleteInvitation } from "@/hooks/useInvite";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface SupplierCardProps {
  id: string;
  name: string;
  location?: string;
  phone?: string;
  email: string;
  company?: string;
  nextAppointment?: string;
  status: "Active" | "Pending" | "Cancelled";
}

export function InvitationsCard({
  id,
  name,
  location, 
  phone,
  email,
  status,
}: SupplierCardProps) {

  const deleteMutation = useDeleteInvitation();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => setOpenDeleteModal(false),
    });
  };

  return (
    <>
      <Card className="w-full hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{name}</h3>
            </div>
            <Badge
              variant={status === "Active" ? "default" : "secondary"}
              className={cn(
                "text-xs",
                status === "Active"
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700"
              )}
            >
              {status}
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            
            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{location}</span>
              </div>
            )}

        
            {phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{phone}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setOpenDeleteModal(true)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this invitation? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOpenDeleteModal(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

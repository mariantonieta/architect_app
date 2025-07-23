import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Calendar, Trash2 } from "lucide-react"
import { useDeleteInvitation } from "@/hooks/useInvite"

interface SupplierCardProps {
  id: string
  name: string
  category: string
  location: string
  phone: string
  email: string
  nextAppointment: string
  status: "Active" | "Pending" | "Cancelled"
}

export function SupplierCard({
  id,
  name,
  category,
  location,
  phone,
  email,
  nextAppointment,
  status,
}: SupplierCardProps) {
  const deleteMutation = useDeleteInvitation()

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this invitation?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{name}</h3>
            <p className="text-sm text-gray-600">{category}</p>
          </div>
          <Badge
            variant={status === "Active" ? "default" : "secondary"}
            className={cn(
              "text-xs",
              status === "Active" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-200 text-gray-700",
            )}
          >
            {status}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{phone}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{email}</span>
          </div>

      
        </div>

        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

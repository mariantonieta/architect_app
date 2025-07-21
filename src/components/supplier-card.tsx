import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Calendar } from "lucide-react"

interface SupplierCardProps {
  name: string
  category: string
  location: string
  phone: string
  email: string
  nextAppointment: string
  status: "Active" | "Pending" | "Cancelled"
}

export function SupplierCard({ name, category, location, phone, email, nextAppointment, status }: SupplierCardProps) {
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

        <div className="space-y-3">
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

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Próxima cita: {nextAppointment}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarIcon as CalendarIconLucide,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CreateSupplierModalProps {
  onCreateSupplier?: (supplier: any) => void
}

const specialties = [
  "Construction",
  "Materials Supply",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Roofing",
  "Flooring",
  "Painting",
  "Landscaping",
  "Security Systems",
]

export function CreateSupplierModal({ onCreateSupplier }: CreateSupplierModalProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    location: "",
    status: "Active",
    nextAppointment: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const supplierData = {
      ...formData,
      nextAppointment: date ? format(date, "dd/MM/yyyy") : "",
    }

    onCreateSupplier?.(supplierData)

    // Reset form
    setFormData({
      name: "",
      specialty: "",
      phone: "",
      email: "",
      location: "",
      status: "Active",
      nextAppointment: "",
      description: "",
    })
    setDate(undefined)
    setOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-800 hover:bg-gray-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5" />
            Create New Supplier
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Name and Specialty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                <User className="h-4 w-4" />
                Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., ABC Construction"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-sm font-medium">
                Specialty *
              </Label>
              <Select
                value={formData.specialty}
                onValueChange={(value) => handleInputChange("specialty", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phone and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., +1 234 567 890"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Location and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., New York, Los Angeles"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Next Appointment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <CalendarIconLucide className="h-4 w-4" />
              Next Appointment (Optional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : "dd/mm/yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Description / Notes
            </Label>
            <Textarea
              id="description"
              placeholder="Additional information about the supplier..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white">
              Create Supplier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

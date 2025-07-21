import { Button } from "@/components/ui/button"
import { SupplierCard } from "@/components/supplier-card"
import { Plus } from "lucide-react"

const suppliers = [
  {
    name: "Constructora ABC",
    category: "Structure",
    location: "Madrid",
    phone: "+34 123 456 789",
    email: "contacto@abc.com",
    nextAppointment: "14/03/2024",
    status: "Active" as const,
  },
  {
    name: "Materiales XYZ",
    category: "Supplies",
    location: "Barcelona",
    phone: "+34 987 654 321",
    email: "ventas@xyz.com",
    nextAppointment: "17/03/2024",
    status: "Active" as const,
  },
  {
    name: "Instalaciones DEF",
    category: "Electricity",
    location: "Valencia",
    phone: "+34 456 789 123",
    email: "info@def.com",
    nextAppointment: "",
    status: "Pending" as const,
  },
]

export default function SupplierAgenda() {
  return (
    <div className="flex h-screen bg-gray-50">


      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Agenda</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your contacts and appointments with suppliers</p>
            </div>
            <Button className="bg-gray-800 hover:bg-gray-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Supplier
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier, index) => (
              <SupplierCard
                key={index}
                name={supplier.name}
                category={supplier.category}
                location={supplier.location}
                phone={supplier.phone}
                email={supplier.email}
                nextAppointment={supplier.nextAppointment}
                status={supplier.status}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

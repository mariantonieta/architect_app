import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/context/UserContext"

export function SiteHeader() {
  const { user, logout } = useUser()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  const userName = user?.first_name || "Usuario"
  const userRole = user?.role || "Rol desconocido"

  return (
    <header className="flex h-auto items-start justify-between gap-4 border-b bg-white px-6 py-4 shadow-sm transition-all">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-semibold">
            Hello <span className="text-primary">{userName}</span>!
            <span className="ml-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground border">
              {userRole}
            </span>
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Welcome!</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
    </header>
  )
}

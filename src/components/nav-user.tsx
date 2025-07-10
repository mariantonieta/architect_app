import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconSettings,
} from "@tabler/icons-react"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/hooks/useUser"
import { useQueryClient } from "@tanstack/react-query"

export function NavUser() {
  const { data: user, isLoading } = useUser()
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  function handleAccountClick() {
    navigate("/account")
  }

  function handleSettingsClick() {
    navigate("/settings")
  }

  function handleLogout() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_id")
    localStorage.removeItem("user")
    queryClient.clear()
    navigate("/login")
  }

  if (isLoading || !user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex items-center gap-2 truncate text-left">
                <IconSettings className="size-4" />
                <span className="text-sm">Settings</span>
              </div>
              <IconDotsVertical className="size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-3 py-2 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarFallback>
                    {user.first_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid text-sm leading-tight">
                  <span className="font-medium">{user.first_name}</span>
                  <span className="text-muted-foreground text-xs truncate">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccountClick} className="flex items-center gap-2 cursor-pointer">
                <IconUserCircle className="size-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification className="size-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
              <IconLogout className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

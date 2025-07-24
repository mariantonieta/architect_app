import * as React from "react"
import { Link } from "react-router-dom"
import {
  
  IconDashboard,
  IconHome,
  IconCalendar,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,

  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useUser } from "@/hooks/useUser"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading, error } = useUser();

  if (isLoading || error || !user) return null;

  const allItems = {
    dashboard: { title: "Dashboard", url: "/", icon: IconHome },
    projects: { title: "Projects", url: "/projects", icon: IconFolder },
    supplierAgenda: { title: "Supplier's Agenda", url: "/suppliers-agenda", icon: IconCalendar },
    customersAgenda: { title: "Customer's Agenda", url: "/customers-agenda", icon: IconCalendar },
    architectAgenda: { title: "Architect's Agenda", url: "/architect-agenda", icon: IconCalendar },
    budgets: { title: "Budgets", url: "/supplier-budgets", icon: IconReport },
    relations: { title: "Relations", url: "/supplier/relations", icon: IconUsers },
  };
  let navMain = [];

  switch (user.role) {
    case "supplier":
      navMain = [allItems.dashboard, allItems.budgets, allItems.relations];
      break;
    case "customer":
      navMain = [allItems.projects];
      break;
    case "architect":
      navMain = [allItems.dashboard, allItems.projects, allItems.customersAgenda, allItems.architectAgenda, allItems.supplierAgenda];
      break;
  
    default:
      navMain = []; 
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Propus App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

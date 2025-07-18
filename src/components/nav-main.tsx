import React from "react";
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";
import { useLocation, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CreateProject } from "./create-project";
import { useCreateProjectModal } from "@/hooks/useCreateProjectModal";
import { useRolePermissions } from "@/middleware/role-based-access";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {

  const location = useLocation(); // Hook para obtener la ubicación actual
  const { openModal } = useCreateProjectModal(); // Hook para controlar el modal
  const { isArchitect } = useRolePermissions(); // Hook para verificar el rol

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {/* Solo mostrar el botón de "New Project" para arquitectos */}
          {isArchitect && (
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                onClick={openModal} // Usar openModal del hook
              >
                <IconCirclePlusFilled />
                <span>New Project</span>
              </SidebarMenuButton>
              

              {/* <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Button> */}
            </SidebarMenuItem>
          )}
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => {
            // Verificar si el item actual está activo
            const isActive =
              location.pathname === item.url ||
              (item.url !== "/" && location.pathname.startsWith(item.url));

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  asChild
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

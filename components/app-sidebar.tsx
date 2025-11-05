"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-client"
import {
  IconBug,
  IconChecklist,
  IconDashboard,
  IconListDetails,
  IconSettings,
  IconTool,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
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

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: IconUsers,
    },
    {
      title: "Sales Orders",
      url: "/sales-orders",
      icon: IconListDetails,
    },
    {
      title: "Work Orders",
      url: "/work-orders",
      icon: IconTool,
    },
    {
      title: "Quality Control",
      url: "/quality-control",
      icon: IconChecklist,
    },
  ],
  navClouds: [],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Debug",
      url: "/debug",
      icon: IconBug,
    },
  ],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = user ? {
    name: user.name || "User",
    email: user.email || "user@example.com",
    avatar: "/codeguide-logo.png", // We don't have avatar from Supabase user
  } : {
    name: "Guest",
    email: "guest@example.com",
    avatar: "/codeguide-logo.png",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image src="/codeguide-logo.png" alt="CodeGuide" width={32} height={32} className="rounded-lg" />
                <span className="text-base font-semibold font-parkinsans">CodeGuide</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavSecondary items={staticData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

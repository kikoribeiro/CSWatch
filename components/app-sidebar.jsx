"use client"

import * as React from "react"
import {
  Frame,
  Map,
  PieChart,
} from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { BrandTitle } from "@/components/brand-title"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  
  projects: [
    {
      name: "Skins",
      url: "#",
      icon: "/icons8-ak-47-48.png",
    },
    {
      name: "Agents",
      url: "#",
      icon: "/icons8-man-50.png",
    },
    {
      name: "Maps",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BrandTitle />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <div>
          <a href="#">View all</a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd
} from "lucide-react";
import { FcVoicePresentation } from "react-icons/fc";
import { GoArchive, GoUnfold } from "react-icons/go";
import { MdDashboard, MdOutlineApproval } from "react-icons/md";
import { TfiClipboard } from "react-icons/tfi";
import SideUser from "./side-user";

// const data = {
//   user: {
//     name: "shadcn",
//     email: "m@example.com",
//     avatar: "/avatars/shadcn.jpg",
//   },
//   teams: [
//     {
//       name: "Acme Inc",
//       logo: GalleryVerticalEnd,
//       plan: "Enterprise",
//     },
//     {
//       name: "Acme Corp.",
//       logo: AudioWaveform,
//       plan: "Startup",
//     },
//     {
//       name: "Evil Corp.",
//       logo: Command,
//       plan: "Free",
//     },
//   ],
// }


// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: MdDashboard,
  },

  {
    title: "Customer Requests",
    url: "customerreq",
    icon: FcVoicePresentation,
  },
  {
    title: "New NDT Inspection Form",
    url: "newtask",
    icon: TfiClipboard,
  },
  {
    title: "Equipment/Tools Inventory",
    url: "equipmentinventory",
    icon: GoArchive,
  },
  {
    title: "Consumbales Inventory",
    url: "consumeinventory",
    icon: GoUnfold,
  },
  {
    title: "Approval Form",
    url: "approvalpage",
    icon: MdOutlineApproval,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard Sidebar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SideUser />
      </SidebarFooter>
    </Sidebar>
  )
}
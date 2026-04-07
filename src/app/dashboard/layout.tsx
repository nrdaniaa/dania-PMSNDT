import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type React from "react";

export default function DashboardLayout({ children,}: { children: React.ReactNode }) {

    return (
        <SidebarProvider>
            <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
    );
}
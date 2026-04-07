'use client'
import { AppSidebar } from "@/components/app-sidebar"
import { StockData } from "@/components/stockdata"
import { TableEquipInventory } from "@/components/tableinventory"
import { TimeDate } from "@/components/time-date"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export default function ConsumeInventory() {
    return (
        <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            {/* Left section: Breadcrumb + sidebar trigger */}
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="h-4" />
                <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/taskassign">Consumable Inventory</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>
            <TimeDate />
            </header>
            <main className="flex flex-1 flex-col gap-10 p-4 pt-0">
                        <div className="flex justify-center">
                            <div className="bg-gray-200 border border-black-300 text-black px-4 py-3 rounded-lg text-center">
                            <p className="font-semibold text-xl mb-3">Consumeable Inventory</p>
                            </div>
                        </div>
                        <StockData />
                        <TableEquipInventory />
                        </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
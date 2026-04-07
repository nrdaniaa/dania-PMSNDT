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

type EquipmentRow = {
    equipmentNumber: string;
    description: string;
    partNumber: string;
    serialNumber: string;
    calibrationDue: string;
    g7Loan: string;
    location: string;
    quantity: string;
    remarks: string;
    lastEdit: string;
};

export default function EquipmentInventory() {
    return (
        <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between px-4">
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
                    <BreadcrumbLink href="/customerreq">Equipment/Tools Inventory</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>
            <TimeDate />
            </header>

            <main className="flex flex-1 flex-col gap-10 p-4 pt-0">
                <div className="flex justify-center">
                    <div className="bg-gray-200 border border-black-300 text-black px-4 py-3 rounded-lg text-center">
                        <p className="font-semibold text-xl mb-3">Equipments/Tools Inventory</p>
                    </div>
                </div>
                <StockData />
                <TableEquipInventory />
            </main>
        </SidebarInset>
        </SidebarProvider>
    )
}
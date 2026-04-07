'use client'
import { AlertTaskDue } from "@/components/alert-taskdue"
import { AppSidebar } from "@/components/app-sidebar"
import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from "next/link"; // for actions (safe to keep even if not used yet)

    import { TimeDate } from "@/components/time-date"

    export default function dashboard() {
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
                </BreadcrumbList>
                </Breadcrumb>
            </div>

            <TimeDate />
            </header>

            <div className="flex flex-1 flex-col gap-10 p-4 pt-0">
            {/* Alert for Overdue Task */}
            <div className="flex justify-center">
                <div className="bg-red-100 border-[1px] border-red-300 text-red-800 px-4 py-3 rounded-lg w-fit text-center">
                <p className="font-semibold mb-3">⚠️ You have overdue tasks that need immediate attention.</p>
                <AlertTaskDue />
                </div>
            </div>

            <div className="flex flex-col gap-10">
                {/* Carousel Section */}
                <div className="w-full border border-Black-50 rounded-lg p-4">
                <div className="bg-white dark:bg-[#1b1b1b] border border-border p-4 rounded-lg w-full">
                    <Carousel opts={{ align: "start" }} orientation="vertical" className="w-full">
                    <CarouselContent className="-mt-1 h-[200px] text-center">
                        {[
                        { title: "Meeting Reminder", message: "Project sync at 3:00 PM." },
                        { title: "New Comment", message: "A comment was added to Task A." },
                        { title: "System Update", message: "Maintenance scheduled at midnight." },
                        { title: "New Task", message: "A new task has been assigned to you." }
                        ].map((notification, index) => (
                        <CarouselItem key={index} className="pt-1 md:basis-1/2">
                            <div className="p-1">
                            <Card>
                                <CardContent className="p-4 space-y-2">
                                <h4 className="text-lg font-semibold">{notification.title}</h4>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                </CardContent>
                            </Card>
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                    </Carousel>
                </div>
                </div>

                {/* Task Detail Progress Section (Moved below) */}
                <div className="w-full">
                <div className="bg-white dark:bg-[#1b1b1b] border border-border p-6 rounded-xl shadow-md space-y-4">
                    <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Task Detail</h2>
                    <Badge variant="secondary">Due: TBD</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Assigned to: Operator Name</p>
                    <Progress value={65} />
                    <p className="text-sm text-muted-foreground">Task Assignment Status : 65% Completed</p>
                    <Progress value={20} />
                    <p className="text-sm text-muted-foreground">Unknown: 20% completed</p>
                    <Progress value={20} />
                    <p className="text-sm text-muted-foreground">Unknown: 20% completed</p>
                </div>
                </div>

                {/* NEW: Report Forms (Civilian left, Military right) */}
                <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Civilian (left) */}
                    <div className="bg-white dark:bg-[#1b1b1b] border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold">Report Form — Civilian</h3>
                        <Badge variant="outline">Civilian</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create and manage reports for civilian aircraft and components.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Link
                        href="/reportpagecivilian"
                        className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                        >
                        View Drafts
                        </Link>
                    </div>
                    </div>

                    {/* Military (right) */}
                    <div className="bg-white dark:bg-[#1b1b1b] border border-border p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold">Report Form — Military</h3>
                        <Badge>Military</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create and manage reports for military aircraft and components.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Link
                        href="/reportpageone"
                        className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                        >
                        View Drafts
                        </Link>
                    </div>
                    </div>
                </div>
                </div>
                {/* END new section */}
            </div>
            </div>
        </SidebarInset>
        </SidebarProvider>
    )
}

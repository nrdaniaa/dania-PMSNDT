'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { TimeDate } from "@/components/time-date"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useState } from "react"

    /* ---------------- Types ---------------- */
    type NDTMethod =
    | "Penetrant Testing"
    | "Magnetic Particle Testing"
    | "Eddy Current Testing"
    | "Ultrasonic Testing"
    | "Thermography Testing"

    const METHOD_OPTIONS: NDTMethod[] = [
    "Penetrant Testing",
    "Magnetic Particle Testing",
    "Eddy Current Testing",
    "Ultrasonic Testing",
    "Thermography Testing",
    ]

    type NDTCategory = "Military" | "Civilian"

    type NDTFormDraft = {
    ndtReportNumber: string
    workOrder: string
    taskReference: string
    operatorCustomer: string
    aircraftRegistration: string
    aircraftType: string
    /** NEW: Military or Civilian */
    category: NDTCategory | ""
    component: {
        description: string
        partNumber: string
        serialNumber: string
        quantity: number | ""
    }
    ndtMethods: NDTMethod[]
    }

    /* ---------------- Component ---------------- */
    export default function NewTask() {
    const router = useRouter()

    const [form, setForm] = useState<NDTFormDraft>({
        ndtReportNumber: "",
        workOrder: "",
        taskReference: "",
        operatorCustomer: "",
        aircraftRegistration: "",
        aircraftType: "",
        category: "", // NEW: default empty until chosen
        component: {
        description: "",
        partNumber: "",
        serialNumber: "",
        quantity: "",
        },
        ndtMethods: [],
    })

    const handleTopChange = (key: keyof NDTFormDraft, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const handleComponentChange = (key: keyof NDTFormDraft["component"], value: string) => {
        setForm(prev => ({
        ...prev,
        component: {
            ...prev.component,
            [key]: key === "quantity" ? (value === "" ? "" : Number(value)) : value,
        },
        }))
    }

    const toggleMethod = (method: NDTMethod) => {
        setForm(prev => {
        const exists = prev.ndtMethods.includes(method)
        return {
            ...prev,
            ndtMethods: exists ? prev.ndtMethods.filter(m => m !== method) : [...prev.ndtMethods, method],
        }
        })
    }

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
        e.preventDefault()
        router.push("/reportpageone")
    }

    return (
        <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
                    <BreadcrumbLink href="/newtask">New NDT Inspection Form</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>
            <TimeDate />
            </header>

            <main className="p-6 ">
            <h1 className="text-2xl font-bold text-center mb-8">New NDT Inspection Form</h1>

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm "
            >
                <h2 className="text-lg font-semibold text-neutral-800 text-center">NDT Inspection Form</h2>
                <hr className="my-4 border-neutral-300" />

                {/* Top Info */}
                <div className="grid grid-cols-1 gap-5">
                <Field
                    label="NDT Report Number"
                    value={form.ndtReportNumber}
                    onChange={v => handleTopChange("ndtReportNumber", v)}
                />
                <Field
                    label="Work Order"
                    value={form.workOrder}
                    onChange={v => handleTopChange("workOrder", v)}
                />
                <Field
                    label="Task Reference"
                    value={form.taskReference}
                    onChange={v => handleTopChange("taskReference", v)}
                />
                <Field
                    label="Operator / Customer"
                    value={form.operatorCustomer}
                    onChange={v => handleTopChange("operatorCustomer", v)}
                />
                <div className="grid gap-5 md:grid-cols-2">
                    <Field
                    label="Aircraft Registration"
                    value={form.aircraftRegistration}
                    onChange={v => handleTopChange("aircraftRegistration", v)}
                    />
                    <Field
                    label="Aircraft Type"
                    value={form.aircraftType}
                    onChange={v => handleTopChange("aircraftType", v)}
                    />
                </div>
                </div>

                {/* Component Section */}
                <hr className="my-8 border-neutral-300" />
                <h3 className="text-md font-semibold text-neutral-800 text-center">
                Component / Area of Inspection
                </h3>

                <div className="mt-4 grid gap-5 md:grid-cols-2">
                <Field
                    label="Description"
                    value={form.component.description}
                    onChange={v => handleComponentChange("description", v)}
                />
                <Field
                    label="Part Number"
                    value={form.component.partNumber}
                    onChange={v => handleComponentChange("partNumber", v)}
                />
                <Field
                    label="Serial Number"
                    value={form.component.serialNumber}
                    onChange={v => handleComponentChange("serialNumber", v)}
                />
                <Field
                    label="Quantity"
                    type="number"
                    value={String(form.component.quantity)}
                    onChange={v => handleComponentChange("quantity", v)}
                    inputProps={{ min: 0 }}
                />
                </div>

                {/* NDT Method Section */}
                <hr className="my-8 border-neutral-300" />
                <h3 className="text-md font-semibold text-neutral-800 text-center">
                NDT Method <span className="font-normal italic text-neutral-500">(tick the applicable box)</span>
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {METHOD_OPTIONS.map(option => (
                    <label
                    key={option}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 hover:bg-neutral-50"
                    >
                    <input
                        type="checkbox"
                        checked={form.ndtMethods.includes(option)}
                        onChange={() => toggleMethod(option)}
                        className="h-4 w-4 rounded border-neutral-300"
                    />
                    <span className="text-sm text-neutral-800">{option}</span>
                    </label>
                ))}
                </div>

                {/* NEW: Category (Military / Civilian) */}
                <hr className="my-8 border-neutral-300" />
                <h3 className="text-md font-semibold text-neutral-800 text-center">Category</h3>
                <div className="flex justify-center">
                <div className="mt-2 flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 hover:bg-neutral-50 cursor-pointer">
                    <input
                        type="radio"
                        name="category"
                        value="Military"
                        checked={form.category === "Military"}
                        onChange={() => handleTopChange("category", "Military")}
                        className="h-4 w-4 border-neutral-300"
                    />
                    <span className="text-sm text-neutral-800">Military</span>
                    </label>

                    <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 hover:bg-neutral-50 cursor-pointer">
                    <input
                        type="radio"
                        name="category"
                        value="Civilian"
                        checked={form.category === "Civilian"}
                        onChange={() => handleTopChange("category", "Civilian")}
                        className="h-4 w-4 border-neutral-300"
                    />
                    <span className="text-sm text-neutral-800">Civilian</span>
                    </label>
                </div>
                </div>
                {form.category === "" && (
                <p className="mt-2 text-xs text-neutral-500 text-center">Please select one.</p>
                )}

                {/* Actions */}
                <div className="mt-8 flex items-center justify-end gap-3">
                <button
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    type="submit"
                >
                    Save Changes (Go to Report Page One)
                </button>
                </div>
            </form>
            </main>
        </SidebarInset>
        </SidebarProvider>
    )
    }

    /* ---------------- Small UI Helper ---------------- */
    function Field({
    label,
    value,
    onChange,
    type = "text",
    inputProps,
    }: {
    label: string
    value: string
    onChange: (v: string) => void
    type?: "text" | "number"
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
    }) {
    const id = label.toLowerCase().replace(/\s+|\//g, "-")
    return (
        <div>
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
            {label}
        </label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
            {...inputProps}
        />
        </div>
    )
}
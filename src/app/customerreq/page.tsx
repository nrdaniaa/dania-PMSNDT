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
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect, useMemo, useRef, useState } from "react"

    type CustomerReqDraft = {
    requestId: string
    requestDate: string
    customerName: string
    company?: string
    contactPhone?: string
    contactEmail?: string
    aircraftReg?: string
    aircraftType?: string
    workOrder?: string
    taskRef?: string
    location?: string
    areaOfInspection?: string
    ndtMethods: string[]
    priority: "Low" | "Normal" | "High" | "AOG"
    dueDate?: string
    attachments?: { name: string; url: string }[]
    notes?: string
    }

    const DRAFT_KEY = "customerReq:draft:v1"
    const NDT_METHODS = [
    "Dye Penetrant (PT)",
    "Magnetic Particle (MT)",
    "Eddy Current (ET)",
    "Ultrasonic (UT)",
    "Radiographic (RT)",
    "Thermography (TT)",
    "Borescope / Visual (VT)",
    ]

    export default function CustomerReq() {
    const [form, setForm] = useState<CustomerReqDraft>({
        requestId: "",
        requestDate: new Date().toISOString().slice(0, 10),
        customerName: "",
        company: "",
        contactPhone: "",
        contactEmail: "",
        aircraftReg: "",
        aircraftType: "",
        workOrder: "",
        taskRef: "",
        location: "",
        areaOfInspection: "",
        ndtMethods: [],
        priority: "Normal",
        dueDate: "",
        attachments: [],
        notes: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // --- helpers ---
    const update = <K extends keyof CustomerReqDraft>(key: K, value: CustomerReqDraft[K]) =>
        setForm((f) => ({ ...f, [key]: value }))

    const toggleMethod = (method: string) =>
        setForm((f) => {
        const set = new Set(f.ndtMethods)
        set.has(method) ? set.delete(method) : set.add(method)
        return { ...f, ndtMethods: Array.from(set) }
        })

    const genId = () => {
        // eg: CRQ-2025-09-30-xxxxx
        const d = new Date()
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        const rnd = (typeof crypto !== "undefined" && "randomUUID" in crypto)
        ? (crypto.randomUUID().slice(0, 5))
        : Math.random().toString(36).slice(2, 7)
        return `CRQ-${y}-${m}-${day}-${rnd}`.toUpperCase()
    }

    const validate = (): boolean => {
        const e: Record<string, string> = {}
        if (!form.customerName.trim()) e.customerName = "Customer / Contact is required."
        if (!form.requestDate) e.requestDate = "Request Date is required."
        if (!form.ndtMethods.length) e.ndtMethods = "Select at least one NDT method."
        if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
        e.contactEmail = "Invalid email format."
        if (form.dueDate && form.requestDate && form.dueDate < form.requestDate)
        e.dueDate = "Due Date cannot be earlier than Request Date."
        setErrors(e)
        return Object.keys(e).length === 0
    }

    // --- localStorage (autosave every change after initial mount) ---
    useEffect(() => {
        // Load existing draft if any
        try {
        const raw = localStorage.getItem(DRAFT_KEY)
        if (raw) {
            const parsed: CustomerReqDraft = JSON.parse(raw)
            setForm((f) => ({ ...f, ...parsed }))
        }
        } catch {}
    }, [])

    useEffect(() => {
        try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
        // Optional: broadcast event if you have listeners elsewhere
        window.dispatchEvent(new CustomEvent("customerReq:draft-updated"))
        } catch {}
    }, [form])

    const saveDraft = () => {
        try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
        alert("Draft saved.")
        } catch {
        alert("Failed to save draft.")
        }
    }

    const loadDraft = () => {
        try {
        const raw = localStorage.getItem(DRAFT_KEY)
        if (!raw) return alert("No draft found.")
        setForm(JSON.parse(raw))
        alert("Draft loaded.")
        } catch {
        alert("Failed to load draft.")
        }
    }

    const clearDraft = () => {
        if (!confirm("Clear form and remove saved draft?")) return
        localStorage.removeItem(DRAFT_KEY)
        setForm({
        requestId: "",
        requestDate: new Date().toISOString().slice(0, 10),
        customerName: "",
        company: "",
        contactPhone: "",
        contactEmail: "",
        aircraftReg: "",
        aircraftType: "",
        workOrder: "",
        taskRef: "",
        location: "",
        areaOfInspection: "",
        ndtMethods: [],
        priority: "Normal",
        dueDate: "",
        attachments: [],
        notes: "",
        })
        setErrors({})
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        const payload: CustomerReqDraft = {
        ...form,
        requestId: form.requestId || genId(),
        }
        // At this stage you could POST to your API route.
        console.log("SUBMIT CUSTOMER REQUEST:", payload)
        alert(`Customer Request submitted:\n${payload.requestId}`)
        // Keep draft (so user can still edit), or clear—your call:
        // clearDraft()
        setForm(payload) // set the generated ID back in form
    }

    const addAttachment = (files: FileList | null) => {
        if (!files || !files.length) return
        const newItems: { name: string; url: string }[] = []
        Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file)
        newItems.push({ name: file.name, url })
        })
        setForm((f) => ({ ...f, attachments: [...(f.attachments || []), ...newItems] }))
        // reset input
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const removeAttachment = (idx: number) =>
        setForm((f) => ({
        ...f,
        attachments: (f.attachments || []).filter((_, i) => i !== idx),
        }))

    // derived
    const methodCount = form.ndtMethods.length
    const idHint = useMemo(() => (form.requestId ? "" : "Will be generated on submit"), [form.requestId])

    return (
        <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            {/* ---- Header ---- */}
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
                    <BreadcrumbLink href="/taskassign">Customer Requests</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>

            <TimeDate />
            </header>

            {/* ---- Content ---- */}
            <main className="p-4 md:p-6">
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">New Customer Request</h1>
                    <p className="text-sm text-muted-foreground">
                    Capture request details for NDT tasking, attachments, and deadlines.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                    type="button"
                    onClick={loadDraft}
                    className="rounded-md border px-3 py-2 text-sm"
                    >
                    Load Draft
                    </button>
                    <button
                    type="button"
                    onClick={saveDraft}
                    className="rounded-md border px-3 py-2 text-sm"
                    >
                    Save Draft
                    </button>
                    <button
                    type="button"
                    onClick={clearDraft}
                    className="rounded-md border px-3 py-2 text-sm"
                    >
                    Clear
                    </button>
                </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-8">
                {/* Section: Identifiers */}
                <section className="rounded-lg border p-4">
                    <h2 className="mb-4 font-medium">Identifiers</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Request No.</label>
                        <input
                        value={form.requestId}
                        onChange={(e) => update("requestId", e.target.value.toUpperCase())}
                        placeholder="CRQ-YYYY-MM-DD-XXXXX"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">{idHint}</p>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Request Date</label>
                        <input
                        type="date"
                        value={form.requestDate}
                        onChange={(e) => update("requestDate", e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                        {errors.requestDate && (
                        <p className="mt-1 text-xs text-red-600">{errors.requestDate}</p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Priority</label>
                        <select
                        value={form.priority}
                        onChange={(e) => update("priority", e.target.value as CustomerReqDraft["priority"])}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        >
                        <option>Low</option>
                        <option>Normal</option>
                        <option>High</option>
                        <option>AOG</option>
                        </select>
                    </div>
                    </div>
                </section>

                {/* Section: Customer / Contact */}
                <section className="rounded-lg border p-4">
                    <h2 className="mb-4 font-medium">Customer / Contact</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <label className="mb-1 block text-sm font-medium">Customer / Contact<span className="text-red-600">*</span></label>
                        <input
                        value={form.customerName}
                        onChange={(e) => update("customerName", e.target.value)}
                        placeholder="Name of requester"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                        {errors.customerName && (
                        <p className="mt-1 text-xs text-red-600">{errors.customerName}</p>
                        )}
                    </div>
                    <div className="md:col-span-1">
                        <label className="mb-1 block text-sm font-medium">Company</label>
                        <input
                        value={form.company || ""}
                        onChange={(e) => update("company", e.target.value)}
                        placeholder="Organization"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="mb-1 block text-sm font-medium">Location / Base</label>
                        <input
                        value={form.location || ""}
                        onChange={(e) => update("location", e.target.value)}
                        placeholder="Hangar / Line / Site"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Phone</label>
                        <input
                        value={form.contactPhone || ""}
                        onChange={(e) => update("contactPhone", e.target.value)}
                        placeholder="+60..."
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Email</label>
                        <input
                        value={form.contactEmail || ""}
                        onChange={(e) => update("contactEmail", e.target.value)}
                        placeholder="name@company.com"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                        {errors.contactEmail && (
                        <p className="mt-1 text-xs text-red-600">{errors.contactEmail}</p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Due Date</label>
                        <input
                        type="date"
                        value={form.dueDate || ""}
                        onChange={(e) => update("dueDate", e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                        {errors.dueDate && (
                        <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>
                        )}
                    </div>
                    </div>
                </section>

                {/* Section: Aircraft / Work Details */}
                <section className="rounded-lg border p-4">
                    <h2 className="mb-4 font-medium">Aircraft / Work Details</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Aircraft Registration</label>
                        <input
                        value={form.aircraftReg || ""}
                        onChange={(e) => update("aircraftReg", e.target.value.toUpperCase())}
                        placeholder="9M-XXX"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Aircraft Type</label>
                        <input
                        value={form.aircraftType || ""}
                        onChange={(e) => update("aircraftType", e.target.value.toUpperCase())}
                        placeholder="A320 / B737 / etc."
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Work Order</label>
                        <input
                        value={form.workOrder || ""}
                        onChange={(e) => update("workOrder", e.target.value.toUpperCase())}
                        placeholder="WO-XXXXX"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Task Reference</label>
                        <input
                        value={form.taskRef || ""}
                        onChange={(e) => update("taskRef", e.target.value.toUpperCase())}
                        placeholder="SRM/AMM/NDT MANUAL REF"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Component / Area of Inspection</label>
                        <input
                        value={form.areaOfInspection || ""}
                        onChange={(e) => update("areaOfInspection", e.target.value)}
                        placeholder="e.g., LH Wing Root, Nose Gear Fork, Fuselage Frame 18"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    </div>

                    <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium">NDT Methods<span className="text-red-600">*</span></label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {NDT_METHODS.map((m) => (
                        <label
                            key={m}
                            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                        >
                            <input
                            type="checkbox"
                            checked={form.ndtMethods.includes(m)}
                            onChange={() => toggleMethod(m)}
                            />
                            <span>{m}</span>
                        </label>
                        ))}
                    </div>
                    {errors.ndtMethods && (
                        <p className="mt-1 text-xs text-red-600">{errors.ndtMethods}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{methodCount} selected</p>
                    </div>
                </section>

                {/* Section: Attachments & Notes */}
                <section className="rounded-lg border p-4">
                    <h2 className="mb-4 font-medium">Attachments & Notes</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Attachments (photos, refs)</label>
                        <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={(e) => addAttachment(e.target.files)}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        />
                        {form.attachments && form.attachments.length > 0 && (
                        <ul className="mt-2 space-y-2 text-sm">
                            {form.attachments.map((att, i) => (
                            <li key={`${att.name}-${i}`} className="flex items-center justify-between gap-2 rounded border p-2">
                                <div className="min-w-0">
                                <p className="truncate font-medium">{att.name}</p>
                                <a href={att.url} target="_blank" className="text-xs underline">preview</a>
                                </div>
                                <button
                                type="button"
                                onClick={() => removeAttachment(i)}
                                className="rounded-md border px-2 py-1 text-xs"
                                >
                                Remove
                                </button>
                            </li>
                            ))}
                        </ul>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Notes / Special Instructions</label>
                        <textarea
                        value={form.notes || ""}
                        onChange={(e) => update("notes", e.target.value)}
                        rows={8}
                        placeholder="Any constraints, safety notes, access windows, etc."
                        className="w-full resize-y rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <button
                    type="button"
                    onClick={saveDraft}
                    className="rounded-md border px-4 py-2 text-sm"
                    >
                    Save Draft
                    </button>
                    <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                    >
                    Submit Request
                    </button>
                </div>
                </form>
            </div>
            </main>
        </SidebarInset>
        </SidebarProvider>
    )
}
'use client'
import { AppSidebar } from "@/components/app-sidebar"
import { TimeDate } from "@/components/time-date"
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"
import React, { useEffect, useMemo, useRef, useState } from "react"

    /* ---------------- Row types ---------------- */
    type EquipRow = { description: string; partNumber: string; serialNumber: string; calibrationDue: string }
    type ConsumableRow = { description: string; partNumber: string; batchSerial: string; expiryDate: string }

    /* ---------------- Local helpers ---------------- */
    function loadReportLists(): { equip: EquipRow[]; cons: ConsumableRow[] } {
    if (typeof window === "undefined") return { equip: [], cons: [] }
    try {
        const e = JSON.parse(localStorage.getItem("ndt:report:equipRows") || "[]")
        const c = JSON.parse(localStorage.getItem("ndt:report:consRows") || "[]")
        const ensureArray = (x: any) => (Array.isArray(x) ? x : [])
        return { equip: ensureArray(e), cons: ensureArray(c) }
    } catch {
        return { equip: [], cons: [] }
    }
    }

    /* ---------------- Reusable Form Renderer ---------------- */
    function A4ReportForm({
    instanceLabel,
    anchorId,
    initTop,
    initComponent,
    initMethods,
    initEquipRows,
    initConsRows,
    }: {
    instanceLabel: string
    anchorId: string
    initTop: {
        ndtReportNumber: string
        workOrder: string
        taskReference: string
        operatorCustomer: string
        aircraftRegistration: string
        aircraftType: string
    }
    initComponent: {
        description: string
        partNumber: string
        serialNumber: string
        quantity: string
    }
    initMethods: string[]
    initEquipRows: EquipRow[]
    initConsRows: ConsumableRow[]
    }) {
    const [top, setTop] = useState(initTop)
    const [component, setComponent] = useState(initComponent)

    // Enforce single selection while keeping array shape
    const [methods, setMethods] = useState<string[]>(
        (initMethods && initMethods.length > 0) ? [initMethods[0]] : []
    )

    const [certifiedDate, setCertifiedDate] = useState("")
    const formRef = useRef<HTMLDivElement | null>(null)

    // Equipment rows (seed from localStorage if present)
    const [equipRows, setEquipRows] = useState<EquipRow[]>(
        initEquipRows && initEquipRows.length > 0
        ? initEquipRows
        : [{ description: "", partNumber: "", serialNumber: "", calibrationDue: "" }]
    )
    const updateEquip = (i: number, k: keyof EquipRow, v: string) =>
        setEquipRows(r => r.map((row, ix) => (ix === i ? { ...row, [k]: v } : row)))
    const removeEquipRow = (i: number) => setEquipRows(r => r.filter((_, ix) => ix !== i))

    // Consumable rows (seed from localStorage if present)
    const [consRows, setConsRows] = useState<ConsumableRow[]>(
        initConsRows && initConsRows.length > 0
        ? initConsRows
        : [{ description: "", partNumber: "", batchSerial: "", expiryDate: "" }]
    )
    const updateCons = (i: number, k: keyof ConsumableRow, v: string) =>
        setConsRows(r => r.map((row, ix) => (ix === i ? { ...row, [k]: v } : row)))
    const removeConsRow = (i: number) => setConsRows(r => r.filter((_, ix) => ix !== i))

    return (
        <div ref={formRef} id={anchorId} className="flex flex-col items-center gap-4 p-4 pt-0">
        {/* Label for clarity */}
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{instanceLabel}</div>

        {/* === A4 FRAME === */}
        <div className="relative w-[794px] min-h-[1123px] bg-white print:w-[210mm] print:h-[297mm]">
            {/* Outer thin frame */}
            <div className="absolute inset-0 border border-black/70 pointer-events-none" />

            <form className="relative z-10 mx-auto w-[794px] print:w-[210mm] text-[10.5px] leading-tight">
            {/* Custom styles */}
            <style jsx global>{`
                .thin { border: 0.5px solid #000; }
                .thin-b { border-bottom: 0.5px solid #000; }
                .thin-t { border-top: 0.5px solid #000; }
                .thin-l { border-left: 0.5px solid #000; }
                .thin-r { border-right: 0.5px solid #000; }
                .no-r { border-right-width: 0 !important; }
                .no-b { border-bottom-width: 0 !important; }
                .section { background: #efefef; font-weight: 600; }
                .label { padding: 6px 8px; }
                .colon { width: 12px; text-align: center; }
                .value { padding: 2px 8px; }
                .clean-input { outline: none; border: none; width: 100%; padding: 0; margin: 0; }
                .title { font-size: 16px; font-weight: 600; letter-spacing: 0.02em; }
                .row { display: grid; }
                .row > .cell {
                padding: 4px 8px;
                border-right: 0.5px solid #000;
                border-bottom: 0.5px solid #000;
                }
                .row > .cell.no-r { border-right-width: 0; }

                /* Pretty radio that shows a ✓ when checked (square look to match boxes) */
                .tick {
                appearance: none;
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                border: 0.9px solid #000;
                border-radius: 2px; /* change to 50% for circular radio look */
                display: inline-grid;
                place-content: center;
                background: #fff;
                cursor: pointer;
                }
                .tick:focus { outline: none; box-shadow: 0 0 0 1px #0002; }
                .tick:checked::after {
                content: "✓";
                font-size: 14px;
                line-height: 1;
                transform: translateY(-1px);
                }

                @media print {
                @page { size: A4; margin: 10mm; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .avoid { break-inside: avoid; page-break-inside: avoid; }
                .no-print { display: none !important; }
                }
            `}</style>

            {/* Top banner */}
            <div className="grid grid-cols-[210px_1fr] thin-b avoid">
                <div className="h-[64px] flex items-center pl-3">
                <Image src="/g7logo.png" alt="g7logo" width={180} height={38} priority className="dark:invert" />
                </div>
                <div className="flex items-center justify-center text-center">
                <div className="title">NON-DESTRUCTIVE TEST REPORT</div>
                </div>
            </div>

            {/* Header fields */}
            <div className="grid grid-cols-[220px_12px_1fr] thin-l thin-r avoid">
                {[
                ["NDT REPORT NUMBER", "ndtReportNumber"],
                ["WORK ORDER", "workOrder"],
                ["TASK REFERENCE", "taskReference"],
                ["OPERATOR/CUSTOMER", "operatorCustomer"],
                ["AIRCRAFT REGISTRATION", "aircraftRegistration"],
                ["AIRCRAFT TYPE", "aircraftType"],
                ].map(([label, key], i) => (
                <React.Fragment key={label}>
                    <div className={`label thin-r thin-b${i === 0 ? " thin-t" : ""}`}>{label}</div>
                    <div className={`colon thin-r thin-b${i === 0 ? " thin-t" : ""}`}>:</div>
                    <div className={"value thin-b" + (i === 0 ? " thin-t" : "")}>
                    <input
                        className="clean-input"
                        value={(top as any)[key]}
                        onChange={e => setTop(t => ({ ...t, [key]: e.target.value }))}
                    />
                    </div>
                </React.Fragment>
                ))}
            </div>

            {/* COMPONENT/AREA */}
            <div className="thin-t w-full text-center font-bold py-1 border-b border-black">COMPONENT/AREA OF INSPECTION</div>
            <div className="grid grid-cols-[220px_12px_1fr] thin-l thin-r thin-b avoid">
                {[
                ["DESCRIPTION", "description"],
                ["PART NUMBER", "partNumber"],
                ["SERIAL NUMBER", "serialNumber"],
                ["QUANTITY", "quantity"],
                ].map(([label, key]) => (
                <React.Fragment key={label}>
                    <div className="label thin-r thin-b">{label}</div>
                    <div className="colon thin-r thin-b">:</div>
                    <div className="value thin-b">
                    <input
                        className="clean-input"
                        type={key === "quantity" ? "number" : "text"}
                        value={(component as any)[key]}
                        onChange={e => setComponent(c => ({ ...c, [key]: e.target.value }))}
                    />
                    </div>
                </React.Fragment>
                ))}
            </div>

            {/* NDT METHOD (single-select with ✓) */}
            <div className="thin-t w-full text-center font-bold py-1 border-b border-black">
                NDT METHOD <span className="font-normal">(Tick the applicable box)</span>
            </div>
            <div className="thin-l thin-r thin-b avoid">
                <div className="grid grid-cols-5">
                {[
                    "Penetrant Testing",
                    "Magnetic Particle Testing",
                    "Eddy Current Testing",
                    "Ultrasonic Testing",
                    "Thermography Testing",
                ].map((t, idx, arr) => (
                    <div key={t} className={`thin-b thin-r px-2 py-1 font-semibold${idx === arr.length - 1 ? " no-r" : ""}`}>
                    <div className="thin-b h-[40px] px-1 flex items-center justify-center text-center uppercase">{t}</div>
                    <div className="h-[40px] flex items-center justify-center">
                        <input
                        type="radio"
                        name={`ndt-method-${anchorId}`}
                        className="tick"
                        checked={methods.includes(t)}
                        onChange={() => setMethods([t])}
                        aria-label={t}
                        />
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* NDT TECH REF */}
            <div className="text-center thin-l thin-r thin-t py-1 font-semibold avoid">
                NDT TECHNICAL REFERENCE:
            </div>
            <div className="thin-l thin-r thin-b p-2 avoid">
                <textarea className="clean-input h-[50px] resize-none" />
            </div>

            {/* EQUIPMENT */}
            <div className="thin-t w-full text-center font-bold py-1 border-b border-black">
                EQUIPMENT / REFERENCE STANDARD / PROBE DESCRIPTION
            </div>
            <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr_1fr] thin-l thin-r avoid">
                {["DESCRIPTION", "PART NUMBER", "SERIAL NUMBER", "CALIBRATION DUE DATE"].map((h, i, a) => (
                <div
                    key={h}
                    className={`thin-b thin-r px-2 py-1 font-semibold ${i === a.length - 1 ? "no-r" : ""}`}
                >
                    {h}
                </div>
                ))}
            </div>

            {equipRows.map((row, i) => (
                <div
                key={`equip-${i}`}
                className="row thin-l thin-r avoid"
                style={{ gridTemplateColumns: "1.1fr 0.8fr 0.9fr 1fr" }}
                >
                <div className="cell">
                    <input
                    className="clean-input"
                    value={row.description}
                    onChange={(e) => updateEquip(i, "description", e.target.value)}
                    />
                </div>
                <div className="cell">
                    <input
                    className="clean-input"
                    value={row.partNumber}
                    onChange={(e) => updateEquip(i, "partNumber", e.target.value)}
                    />
                </div>
                <div className="cell">
                    <input
                    className="clean-input"
                    value={row.serialNumber}
                    onChange={(e) => updateEquip(i, "serialNumber", e.target.value)}
                    />
                </div>
                <div className="cell">
                    <input
                    type="date"
                    className="clean-input"
                    value={row.calibrationDue}
                    onChange={(e) => updateEquip(i, "calibrationDue", e.target.value)}
                    />
                </div>
                </div>
            ))}

            {/* CONSUMABLES */}
            <div className="thin-t w-full text-center font-bold py-1 border-b border-black">
                CONSUMABLES USED <span className="font-normal">(if applicable)</span>
            </div>
            <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr_1fr] thin-l thin-r avoid">
                {["DESCRIPTION", "PART NUMBER", "BATCH/SERIAL NUMBER", "EXPIRY DATE"].map((h, i, a) => (
                <div
                    key={h}
                    className={`thin-b thin-r px-2 py-1 font-semibold ${i === a.length - 1 ? "no-r" : ""}`}
                >
                    {h}
                </div>
                ))}
            </div>

            {consRows.map((row, i) => (
                <div
                key={`cons-${i}`}
                className="row thin-l thin-r avoid"
                style={{ gridTemplateColumns: "1.1fr 0.8fr 0.9fr 1fr" }}
                >
                <div className="cell">
                    <input
                    className="clean-input"
                    value={row.description}
                    onChange={(e) => updateCons(i, "description", e.target.value)}
                    />
                </div>
                <div className="cell">
                    <input
                    className="clean-input"
                    value={row.partNumber}
                    onChange={(e) => updateCons(i, "partNumber", e.target.value)}
                    />
                </div>
                <div className="cell">
                    <input
                    className="clean-input"
                    value={row.batchSerial}
                    onChange={(e) => updateCons(i, "batchSerial", e.target.value)}
                    />
                </div>
                <div className="cell">
                    <input
                    type="date"
                    className="clean-input"
                    value={row.expiryDate}
                    onChange={(e) => updateCons(i, "expiryDate", e.target.value)}
                    />
                </div>
                </div>
            ))}

            {/* TASK DESCRIPTIONS */}
            <div className="thin-t w-full text-center font-bold py-1 border-b border-black">TASK DESCRIPTIONS</div>
            <div className="thin-l thin-r thin-b p-2 avoid">
                <textarea className="clean-input h-[88px] resize-y" />
            </div>

            {/* INSPECTION RESULTS */}
            <div className="thin-t w-full text-center font-bold py-1 border-b border-black">INSPECTION RESULTS &amp; REMARKS</div>
            <div className="thin-l thin-r thin-b p-2 avoid">
                <textarea className="clean-input h-[105px] resize-y" />
            </div>

            {/* LOCATION (side-by-side with divider) */}
            <div className="grid grid-cols-[220px_12px_1fr_220px_12px_1fr] thin-l thin-r thin-b avoid">

                <div className="value thin-b"></div>
                <div className="value thin-b"></div>
                <div className="value thin-b thin-r">
                <input
                    className="clean-input"
                    type="number"
                    step="0.1"
                    // placeholder="e.g., 2.5"
                    aria-label="Manhours"
                />
                </div>

                {/* LOCATION (right, separated by vertical line) */}
                <div className="label thin-r thin-b thin-l">LOCATION</div>
                <div className="colon thin-r thin-b">:</div>
                <div className="value thin-b">
                <input className="clean-input" aria-label="Location" />
                </div>
            </div>

            {/* CERTIFIED BY */}
            <div className="thin-l thin-r thin-b avoid">
                <div className="thin-t w-full text-center font-bold py-1 border-b border-black">CERTIFIED BY</div>
                <div className="grid grid-cols-3 ">
                <div className="thin-r p-2">
                    <div className="text-[9.5px] mb-1">NAME &amp; SIGNATURE</div>
                    <div className="h-[96px]" />
                </div>
                <div className="thin-r p-2">
                    <div className="text-[9.5px] mb-1">STAMP</div>
                    <div className="h-[96px]" />
                </div>
                <div className="p-2">
                    <input
                    type="date"
                    className="clean-input thin px-1 py-[2px]"
                    value={certifiedDate}
                    onChange={e => setCertifiedDate(e.target.value)}
                    />
                </div>
                </div>
            </div>

            {/* STATEMENT + FOOTER */}
            <div className="px-2 py-2 text-[10px] leading-snug avoid thin-t border border-black">
                <span className="font-semibold">STATEMENT OF CONFORMITY : </span>- THIS IS TO CONFIRM THAT THE ABOVE
                MENTIONED AIRCRAFT/AIRCRAFT COMPONENTS HAVE BEEN INSPECTED IN ACCORDANCE WITH THE CURRENT
                APPLICABLE REFERENCE MANUALS/DOCUMENTS.
            </div>

            <div className="px-2 pb-2 text-[10px] text-gray-700 flex items-center justify-between avoid">
                <div>G7A-SOP-NDT(MIL) R2, Issued date 13 NOV 2024</div>
                <div>Page 1 of 2</div>
            </div>
            </form>
        </div>

        {/* Next Page */}
        <button
            type="button"
            onClick={() => (window.location.href = "/reportpagetwo")}
            className="no-print px-5 py-1 border border-black bg-white text-[12px] font-semibold hover:bg-gray-100"
        >
            Next Page →
        </button>
        </div>
    )
    }

    /* ---------------- Main Page ---------------- */
    export default function ReportPageOne() {
    // Scroll to specific form if requested
    useEffect(() => {
        const q = new URLSearchParams(window.location.search)
        const target = q.get("form")
        const el = document.getElementById(target === "2" ? "form2" : "form1")
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }, [])

    // Empty defaults (no ndt-storage)
    const emptyTop = {
        ndtReportNumber: "", workOrder: "", taskReference: "",
        operatorCustomer: "", aircraftRegistration: "", aircraftType: ""
    }
    const emptyComponent = { description: "", partNumber: "", serialNumber: "", quantity: "" }

    // Prefill lists from Inventory save (localStorage keys)
    const { equip, cons } = useMemo(() => loadReportLists(), [])

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
                    <BreadcrumbLink href="/reportpageone">Report Form Military</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>
            <TimeDate />
            </header>

            {/* Form 1 */}
            <A4ReportForm
            instanceLabel="Form 1"
            anchorId="form1"
            initTop={emptyTop}
            initComponent={emptyComponent}
            initMethods={[]}
            initEquipRows={equip}
            initConsRows={cons}
            />
        </SidebarInset>
        </SidebarProvider>
    )
}
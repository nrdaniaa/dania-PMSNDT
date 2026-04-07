'use client'
import { AppSidebar } from "@/components/app-sidebar"
import { TimeDate } from "@/components/time-date"
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useRef, useState } from "react"

    type UploadBoxProps = {
    label: string
    value: string | null
    setValue: (v: string | null) => void
    inputId: string
    placeholder: string
    }

    function UploadBox({ label, value, setValue, inputId, placeholder }: UploadBoxProps) {
    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setValue(url)
    }

    const openPicker = () => inputRef.current?.click()
    const clearImage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        setValue(null)
        if (inputRef.current) inputRef.current.value = "" // reset input
    }

    return (
        <div>
        <label className="block font-medium mb-2">{label}</label>
        <div
            role="button"
            tabIndex={0}
            aria-label={`Upload ${label}`}
            onClick={openPicker}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
            className="relative border-2 border-dashed border-gray-400 rounded-md w-full h-32 flex items-center justify-center text-gray-500 overflow-hidden cursor-pointer select-none"
        >
            {value ? (
            <>
                <img src={value} alt={`${label} preview`} className="object-contain w-full h-full pointer-events-none" />
                <button
                type="button"
                aria-label={`Clear ${label}`}
                title="Remove"
                onClick={clearImage}
                className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/70 text-white text-sm hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                ✖
                </button>
            </>
            ) : (
            <span className="px-2 text-center">{placeholder}</span>
            )}
            <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            />
        </div>
        </div>
    )
    }

    export default function ApprovalForm() {
    const [date, setDate] = useState<string>("")
    const [stamp, setStamp] = useState<string | null>(null)
    const [signature, setSignature] = useState<string | null>(null)

    // NEW: Category state ("" = not selected yet)
    const [category, setCategory] = useState<"" | "Military" | "Civilian">("")
    const [showCategoryHint, setShowCategoryHint] = useState(false)

    const submitApproval = () => {
        // simple validation: require category
        if (!category) {
        setShowCategoryHint(true)
        // Scroll the category section into view (optional)
        const el = document.getElementById("category-section")
        el?.scrollIntoView({ behavior: "smooth", block: "center" })
        return
        }
        console.log({ date, stamp, signature, category })
        alert("Approval form submitted!")
    }

    return (
        <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            {/* ---- Header ---- */}
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
                    <BreadcrumbLink href="/taskassign">Approval Form</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>
            <TimeDate />
            </header>

            {/* ---- Approval Form Content ---- */}
            <main className="p-6 space-y-8">
            <h1 className="text-xl font-bold">Approval Section</h1>

            {/* Top row: Stamp / Signature / Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UploadBox
                label="Stamp / Seal"
                value={stamp}
                setValue={setStamp}
                inputId="stampUpload"
                placeholder="Place Stamp / Seal Here"
                />

                <UploadBox
                label="Signature"
                value={signature}
                setValue={setSignature}
                inputId="signatureUpload"
                placeholder="Place Signature Here"
                />

                <div>
                <label className="block font-medium mb-2">Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border rounded-md p-2 w-full"
                />
                </div>
            </div>

            {/* Statement of Conformity */}
            <div>
                <label className="block font-medium mb-2">Statement of Conformity</label>
                <div className="border rounded-md p-4 bg-gray-50 text-sm leading-relaxed">
                THIS IS TO CONFIRM THAT THE ABOVE MENTIONED AIRCRAFT/AIRCRAFT COMPONENTS HAVE BEEN
                INSPECTED IN ACCORDANCE WITH THE CURRENT APPLICABLE REFERENCE MANUALS/DOCUMENTS.
                </div>
            </div>

            {/* Category (Military / Civilian) - FIXED */}
            <hr className="my-8 border-neutral-300" />
            <section id="category-section" aria-labelledby="category-label">
                <h3 id="category-label" className="text-md font-semibold text-neutral-800 text-center">
                Category
                </h3>

                <fieldset className="mt-2 flex justify-center" aria-required="true">
                <legend className="sr-only">Select one category</legend>
                <div className="flex flex-wrap gap-3" role="radiogroup" aria-labelledby="category-label">
                    {/* Military */}
                    <label
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer hover:bg-neutral-50 ${
                        category === "Military" ? "border-blue-600 ring-2 ring-blue-200" : "border-neutral-200"
                    }`}
                    >
                    <input
                        type="radio"
                        name="category"
                        value="Military"
                        checked={category === "Military"}
                        onChange={() => {
                        setCategory("Military")
                        setShowCategoryHint(false)
                        }}
                        className="h-4 w-4 border-neutral-300"
                    />
                    <span className="text-sm text-neutral-800">Military</span>
                    </label>

                    {/* Civilian */}
                    <label
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer hover:bg-neutral-50 ${
                        category === "Civilian" ? "border-blue-600 ring-2 ring-blue-200" : "border-neutral-200"
                    }`}
                    >
                    <input
                        type="radio"
                        name="category"
                        value="Civilian"
                        checked={category === "Civilian"}
                        onChange={() => {
                        setCategory("Civilian")
                        setShowCategoryHint(false)
                        }}
                        className="h-4 w-4 border-neutral-300"
                    />
                    <span className="text-sm text-neutral-800">Civilian</span>
                    </label>
                </div>
                </fieldset>

                {(!category || showCategoryHint) && (
                <p className="mt-2 text-xs text-neutral-500 text-center">Please select one.</p>
                )}
            </section>

            {/* Submit Button */}
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={submitApproval}
            >
                Submit Approval
            </button>
            </main>
        </SidebarInset>
        </SidebarProvider>
    )
}
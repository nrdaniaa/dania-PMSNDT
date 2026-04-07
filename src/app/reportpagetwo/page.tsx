'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { TimeDate } from "@/components/time-date"
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"
import { useRouter } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"

    /* ============================== Types & Helpers ============================== */
    type FormData = {
    ndtReportNumber: string
    workOrder: string
    taskReference: string
    operatorCustomer: string
    aircraftRegistration: string
    aircraftType: string
    bodyText: string
    certifiedName: string
    certifiedStamp: string
    certifiedDate: string
    }

    const makeEmptyForm = (): FormData => ({
    ndtReportNumber: "",
    workOrder: "",
    taskReference: "",
    operatorCustomer: "",
    aircraftRegistration: "",
    aircraftType: "",
    bodyText: "",
    certifiedName: "",
    certifiedStamp: "",
    certifiedDate: "",
    })

    function generateId(): string {
    if (typeof crypto !== "undefined") {
        const anyCrypto = crypto as any
        if (typeof anyCrypto.randomUUID === "function") return anyCrypto.randomUUID()
    }
    return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    }

    function rectsOverlap(
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number }
    ) {
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y)
    }

    /* ============================== Page ============================== */
    export default function ReportPageTwo() {
    const router = useRouter()
    const [forms, setForms] = useState<Array<{ id: string; data: FormData }>>([
        { id: generateId(), data: makeEmptyForm() },
    ])

    const updateForm = (id: string, patch: Partial<FormData>) =>
        setForms(prev => prev.map(f => (f.id === id ? { ...f, data: { ...f.data, ...patch } } : f)))

    const addAnotherForm = () =>
        setForms(prev => [...prev, { id: generateId(), data: makeEmptyForm() }])

    const removeForm = (id: string) =>
        setForms(prev => (prev.length <= 1 ? prev : prev.filter(f => f.id !== id)))

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
                    <BreadcrumbLink href="/reportpageone">Report Form Military 1</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/reportpagetwo">Report Form Military 2</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
                </Breadcrumb>
            </div>
            <TimeDate />
            </header>

            <main className="flex flex-1 flex-col gap-6 p-4 pt-0 items-center">
            {forms.map((f, idx) => (
                <NDTReportForm
                key={f.id}
                index={idx}
                totalCount={forms.length}
                form={f.data}
                onChange={(patch) => updateForm(f.id, patch)}
                onRemove={() => removeForm(f.id)}
                canRemove={forms.length > 1}
                />
            ))}

            <div className="w-[794px] mt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                type="button"
                onClick={() => router.push("/reportpageone")}
                className="px-4 py-1 border border-black bg-white text-[12px] font-semibold hover:bg-gray-100 transition-colors"
                >
                ← Back to Page 1
                </button>
                <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="px-4 py-1 border border-black bg-white text-[12px] font-semibold hover:bg-gray-100 transition-colors"
                >
                Submit
                </button>
            </div>

            <button
                type="button"
                onClick={addAnotherForm}
                className="px-4 py-2 border border-black bg-white text-[12px] font-semibold hover:bg-gray-100 transition-colors"
            >
                + Add Another Form
            </button>
            </main>
        </SidebarInset>
        </SidebarProvider>
    )
    }

    /* ============================== Small UI Piece ============================== */
    function LabelRow({
    label,
    value,
    onChange,
    last,
    }: {
    label: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    last?: boolean
    }) {
    return (
        <div className={`grid grid-cols-[220px_1fr] ${last ? "" : "border-b border-black"}`}>
        <div className="border-r border-black px-2 py-1 font-semibold">{label}</div>
        <div className="px-2 py-1">
            <input
            className="w-full border border-gray-300 p-1 text-[12px] outline-none"
            value={value}
            onChange={onChange}
            />
        </div>
        </div>
    )
    }

    /* ============================== Form Component ============================== */
    type ImgItem = {
    id: string
    url: string
    x: number
    y: number
    width: number
    naturalW: number
    naturalH: number
    }

    type NoteBox = {
    id: string
    x: number
    y: number
    w: number
    h: number
    text: string
    }

    function NDTReportForm({
    index,
    totalCount,
    form,
    onChange,
    onRemove,
    canRemove,
    }: {
    index: number
    totalCount: number
    form: FormData
    onChange: (patch: Partial<FormData>) => void
    onRemove: () => void
    canRemove: boolean
    }) {
    // Canvas (draw layer)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const canvasBoxRef = useRef<HTMLDivElement | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [drawEnabled, setDrawEnabled] = useState(false)
    const [eraseEnabled, setEraseEnabled] = useState(false)
    const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null)

    // Images (multi)
    const [images, setImages] = useState<ImgItem[]>([])
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
    const [isDraggingImg, setIsDraggingImg] = useState(false)
    const dragInfo = useRef<{ id: string; startX: number; startY: number; baseX: number; baseY: number } | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // Notes (multi, draggable)
    const [notes, setNotes] = useState<NoteBox[]>([])
    const [dragNote, setDragNote] = useState<{
        id: string
        startX: number
        startY: number
        baseX: number
        baseY: number
    } | null>(null)
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

    // Maintain canvas DPI to container
    useEffect(() => {
        const el = canvasBoxRef.current
        const canvas = canvasRef.current
        if (!el || !canvas) return
        const resize = () => {
        const rect = el.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.width = Math.floor(rect.width * dpr)
        canvas.height = Math.floor(rect.height * dpr)
        canvas.style.width = rect.width + "px"
        canvas.style.height = rect.height + "px"
        const ctx = canvas.getContext("2d")
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Cleanup object URLs
    useEffect(() => {
        return () => {
        images.forEach(i => URL.revokeObjectURL(i.url))
        }
    }, [images])

    // ESC to clear selections
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setSelectedImageId(null)
            setSelectedNoteId(null)
        }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    // Drawing
    const getRelativePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
        return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setSelectedImageId(null)
        setSelectedNoteId(null)
        if (!drawEnabled) return
        setIsDrawing(true)
        setLastPos(getRelativePos(e))
    }
    const handlePointerUp = () => {
        setIsDrawing(false)
        setLastPos(null)
    }
    const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !drawEnabled) return
        const ctx = canvasRef.current?.getContext("2d")
        if (!ctx) return
        const pos = getRelativePos(e)
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.lineWidth = eraseEnabled ? 16 : 2
        ctx.strokeStyle = eraseEnabled ? "#ffffff" : "#ff0000"
        ctx.beginPath()
        const { x, y } = lastPos ?? pos
        ctx.moveTo(x, y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
        setLastPos(pos)
    }
    const clearDrawing = () => {
        const ctx = canvasRef.current?.getContext("2d")
        const c = canvasRef.current
        if (ctx && c) ctx.clearRect(0, 0, c.width, c.height)
    }

    // Image placement & management
    const canvasPadding = 0
    const findNonOverlappingPosition = (w: number, h: number) => {
        const step = 20
        const maxW = canvasBoxRef.current?.clientWidth ?? 0
        const maxH = canvasBoxRef.current?.clientHeight ?? 0
        for (let y = 16; y + h <= maxH - 16; y += step) {
        for (let x = 16; x + w <= maxW - 16; x += step) {
            const rect = { x, y, w, h }
            const collides = images.some(img => {
            const ih = img.width * (img.naturalH / img.naturalW)
            return rectsOverlap(rect, { x: img.x, y: img.y, w: img.width, h: ih })
            })
            if (!collides) return { x, y }
        }
        }
        return { x: 16, y: 16 }
    }

    const onSetBgImage = (fileList: FileList | null) => {
        if (!fileList || !fileList.length) return
        const files = Array.from(fileList).slice(0, 12)
        files.forEach((f) => {
        const url = URL.createObjectURL(f)
        const img = new window.Image()
        img.onload = () => {
            const naturalW = img.naturalWidth || 800
            const naturalH = img.naturalHeight || 600
            const defaultW = Math.min(400, naturalW)
            const defaultH = defaultW * (naturalH / naturalW)
            const pos = findNonOverlappingPosition(defaultW, defaultH)
            setImages(prev => [
            ...prev,
            { id: generateId(), url, x: pos.x, y: pos.y, width: defaultW, naturalW, naturalH }
            ])
        }
        img.onerror = () => URL.revokeObjectURL(url)
        img.src = url
        })
    }

    const clearAllImages = () => {
        images.forEach(i => URL.revokeObjectURL(i.url))
        setImages([])
        setSelectedImageId(null)
    }

    const clearSelectedImage = () => {
        if (!selectedImageId) return
        const target = images.find(i => i.id === selectedImageId)
        if (target) URL.revokeObjectURL(target.url)
        setImages(prev => prev.filter(i => i.id !== selectedImageId))
        setSelectedImageId(null)
    }

    const onImageMouseDown = (e: React.MouseEvent, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        const img = images.find(i => i.id === id)
        if (!img) return
        setSelectedImageId(id)
        setSelectedNoteId(null)
        setIsDraggingImg(true)
        dragInfo.current = { id, startX: e.clientX, startY: e.clientY, baseX: img.x, baseY: img.y }
    }

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
        if (!isDraggingImg || !dragInfo.current) return
        const { id, startX, startY, baseX, baseY } = dragInfo.current
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        setImages(prev => {
            const idx = prev.findIndex(p => p.id === id)
            if (idx < 0) return prev
            const target = prev[idx]
            const newX = Math.round(baseX + dx)
            const newY = Math.round(baseY + dy)
            const newRect = {
            x: newX,
            y: newY,
            w: target.width,
            h: target.width * (target.naturalH / target.naturalW)
            }
            const collides = prev.some((p, j) => {
            if (j === idx) return false
            const ph = p.width * (p.naturalH / p.naturalW)
            return rectsOverlap(newRect, { x: p.x, y: p.y, w: p.width, h: ph })
            })
            if (collides) return prev
            const container = canvasBoxRef.current
            const maxX = (container?.clientWidth ?? 0) - newRect.w - canvasPadding
            const maxY = (container?.clientHeight ?? 0) - newRect.h - canvasPadding
            const clampedX = Math.max(canvasPadding, Math.min(newX, maxX))
            const clampedY = Math.max(canvasPadding, Math.min(newY, maxY))
            const next = [...prev]
            next[idx] = { ...target, x: clampedX, y: clampedY }
            return next
        })
        }
        const onUp = () => {
        setIsDraggingImg(false)
        dragInfo.current = null
        }
        if (isDraggingImg) {
        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
        return () => {
            window.removeEventListener("mousemove", onMove)
            window.removeEventListener("mouseup", onUp)
        }
        }
    }, [isDraggingImg])

    const bind =
        (key: keyof FormData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange({ [key]: e.target.value } as Partial<FormData>)

    const selectedImage = selectedImageId ? images.find(i => i.id === selectedImageId) : null
    const setSelectedWidth = (w: number) => {
        if (!selectedImage) return
        setImages(prev => {
        const idx = prev.findIndex(p => p.id === selectedImage.id)
        if (idx < 0) return prev
        const target = prev[idx]
        const newH = w * (target.naturalH / target.naturalW)
        const proposed = { x: target.x, y: target.y, w, h: newH }
        const overlap = prev.some((p, j) => {
            if (j === idx) return false
            const ph = p.width * (p.naturalH / p.naturalW)
            return rectsOverlap(proposed, { x: p.x, y: p.y, w: p.width, h: ph })
        })
        if (overlap) return prev
        const container = canvasBoxRef.current
        const maxX = (container?.clientWidth ?? 0) - proposed.w - canvasPadding
        const maxY = (container?.clientHeight ?? 0) - proposed.h - canvasPadding
        const clampedX = Math.max(canvasPadding, Math.min(target.x, maxX))
        const clampedY = Math.max(canvasPadding, Math.min(target.y, maxY))
        const next = [...prev]
        next[idx] = { ...target, width: w, x: clampedX, y: clampedY }
        return next
        })
    }

    const handleCanvasAreaMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
        setSelectedImageId(null)
        setSelectedNoteId(null)
        }
    }

    // Notes
    const addNote = () => {
        const container = canvasBoxRef.current
        const W = container?.clientWidth ?? 0
        const H = container?.clientHeight ?? 0
        const w = 200, h = 120
        let pos = { x: 16, y: 16 }
        outer: for (let y = 16; y + h <= H - 16; y += 20) {
        for (let x = 16; x + w <= W - 16; x += 20) {
            const r = { x, y, w, h }
            const collide = notes.some(n => rectsOverlap(r, { x: n.x, y: n.y, w: n.w, h: n.h }))
            if (!collide) { pos = { x, y }; break outer }
        }
        }
        const id = generateId()
        setNotes(prev => [...prev, { id, x: pos.x, y: pos.y, w, h, text: "" }])
        setSelectedNoteId(id)
        setSelectedImageId(null)
    }

    const removeNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id))
        if (selectedNoteId === id) setSelectedNoteId(null)
    }

    const startDragNote = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
        e.preventDefault()
        e.stopPropagation()
        const note = notes.find(n => n.id === id)
        if (!note) return
        setSelectedNoteId(id)
        setSelectedImageId(null)
        setDragNote({ id, startX: e.clientX, startY: e.clientY, baseX: note.x, baseY: note.y })
    }

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
        if (!dragNote) return
        const container = canvasBoxRef.current
        const note = notes.find(n => n.id === dragNote.id)
        if (!note) return
        const dx = e.clientX - dragNote.startX
        const dy = e.clientY - dragNote.startY
        let newX = Math.round(dragNote.baseX + dx)
        let newY = Math.round(dragNote.baseY + dy)
        const maxX = (container?.clientWidth ?? 0) - note.w
        const maxY = (container?.clientHeight ?? 0) - note.h
        newX = Math.max(0, Math.min(newX, maxX))
        newY = Math.max(0, Math.min(newY, maxY))
        setNotes(prev => prev.map(n => n.id === note.id ? { ...n, x: newX, y: newY } : n))
        }
        const onUp = () => setDragNote(null)
        if (dragNote) {
        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
        return () => {
            window.removeEventListener("mousemove", onMove)
            window.removeEventListener("mouseup", onUp)
        }
        }
    }, [dragNote, notes])

    return (
        <div className="flex flex-col items-center">
        {/* A4 CANVAS: 794 x 1123 px */}
        <div className="relative box-border w-[794px] h-[1123px] bg-white border border-black shadow overflow-hidden">
            <div className="grid h-full w-full text-[12px] leading-tight selection:bg-black selection:text-white grid-rows-[auto_auto_minmax(0,1fr)_auto_auto_auto]">
            {/* Header */}
            <div className="grid grid-cols-[220px_1fr] border-b border-black">
                <div className="border-r border-black flex items-center justify-center p-2">
                <div className="h-[64px] flex items-center">
                    <Image className="dark:invert" src="/g7logo.png" alt="g7logo" width={180} height={38} priority />
                </div>
                </div>
                <div className="flex items-center justify-center p-2">
                <div className="font-semibold text-[16px] tracking-wide">NON-DESTRUCTIVE TEST REPORT</div>
                </div>
            </div>

            {/* Thin info table */}
            <div className="border-b border-black">
                <LabelRow label="NDT REPORT NUMBER" value={form.ndtReportNumber} onChange={bind('ndtReportNumber')} />
                <LabelRow label="WORK ORDER" value={form.workOrder} onChange={bind('workOrder')} />
                <LabelRow label="TASK REFERENCE" value={form.taskReference} onChange={bind('taskReference')} />
                <LabelRow label="OPERATOR/CUSTOMER" value={form.operatorCustomer} onChange={bind('operatorCustomer')} />
                <LabelRow label="AIRCRAFT REGISTRATION" value={form.aircraftRegistration} onChange={bind('aircraftRegistration')} />
                <LabelRow label="AIRCRAFT TYPE" value={form.aircraftType} onChange={bind('aircraftType')} last />
            </div>

            {/* Body: text + drawing + images */}
            <div className="border-b border-black overflow-hidden flex flex-col">
                <div className="px-2 pt-2">
                {/* Toolbar */}
                <div className="mb-2 flex flex-wrap gap-2 items-center">
                    <button
                    type="button"
                    onClick={() => setDrawEnabled(v => !v)}
                    className={`px-2 py-1 border ${drawEnabled ? 'bg-black text-white' : 'bg-white'} text-[12px]`}
                    >
                    {drawEnabled ? 'Drawing: ON' : 'Drawing: OFF'}
                    </button>

                    <button
                    type="button"
                    onClick={() => setEraseEnabled(v => !v)}
                    className={`px-2 py-1 border ${eraseEnabled ? 'bg-black text-white' : 'bg-white'} text-[12px]`}
                    disabled={!drawEnabled}
                    title="Toggle between Pen/Eraser"
                    >
                    {eraseEnabled ? 'Eraser' : 'Pen'}
                    </button>

                    <button
                    type="button"
                    onClick={clearDrawing}
                    className="px-2 py-1 border bg-white text-[12px]"
                    disabled={!drawEnabled}
                    >
                    Clear Drawing
                    </button>

                    {/* Images controls */}
                    <div className="ml-4 flex flex-wrap items-center gap-2 text-[12px]">
                    <button
                        type="button"
                        className="px-2 py-1 border bg-white"
                        onClick={() => fileInputRef.current?.click()}
                        title="Add image(s)"
                    >
                        Add Image(s)
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => onSetBgImage(e.target.files)}
                        className="hidden"
                    />

                    <button
                        type="button"
                        className="px-2 py-1 border bg-white disabled:opacity-50"
                        onClick={clearSelectedImage}
                        disabled={!selectedImageId}
                        title="Remove selected image"
                    >
                        Remove Selected
                    </button>

                    <button
                        type="button"
                        className="px-2 py-1 border bg-white disabled:opacity-50"
                        onClick={clearAllImages}
                        disabled={images.length === 0}
                        title="Remove all images"
                    >
                        Clear All Images
                    </button>

                    <div className="flex items-center gap-2">
                        <span>Size</span>
                        <input
                        type="range"
                        min={120}
                        max={800}
                        step={1}
                        value={selectedImage ? selectedImage.width : 400}
                        onChange={(e) => setSelectedWidth(Number(e.target.value))}
                        disabled={!selectedImage}
                        />
                    </div>
                    <span className="text-gray-500">
                        {selectedImage ? Math.round(selectedImage.width) + 'px' : ''}
                    </span>

                    <button
                        type="button"
                        className="ml-3 px-2 py-1 border bg-white text-[12px]"
                        onClick={addNote}
                        title="Add a note box"
                    >
                        + Add Note
                    </button>
                    </div>
                </div>

                {/* Editable text + canvas + multiple images */}
                <div className="h-[480px] border border-gray-300 rounded-sm relative overflow-hidden box-border">
                    {/* Text layer */}
                    <textarea
                    className="w-full h-full p-3 resize-none outline-none"
                    placeholder=""
                    value={form.bodyText}
                    onChange={bind('bodyText')}
                    onFocus={() => {
                        setSelectedImageId(null)
                        setSelectedNoteId(null)
                    }}
                    />

                    {/* Images + Drawing canvas */}
                    <div
                    ref={canvasBoxRef}
                    className="absolute inset-0 overflow-hidden"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                        setSelectedImageId(null)
                        setSelectedNoteId(null)
                        }
                    }}
                    >
                    {images.map(img => {
                        const height = img.width * (img.naturalH / img.naturalW)
                        const isSelected = img.id === selectedImageId
                        return (
                        <img
                            key={img.id}
                            src={img.url}
                            alt=""
                            draggable={false}
                            onMouseDown={(e) => onImageMouseDown(e, img.id)}
                            style={{
                            position: 'absolute',
                            left: img.x,
                            top: img.y,
                            width: img.width,
                            height,
                            cursor: 'move',
                            userSelect: 'none',
                            pointerEvents: 'auto',
                            outline: isSelected ? '2px solid #2563eb' : 'none',
                            outlineOffset: isSelected ? -1 : 0,
                            } as React.CSSProperties}
                        />
                        )
                    })}

                    {/* Drawing canvas on top */}
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handlePointerDown}
                        onMouseUp={handlePointerUp}
                        onMouseLeave={handlePointerUp}
                        onMouseMove={handlePointerMove}
                        className={`absolute inset-0 ${drawEnabled ? 'pointer-events-auto' : 'pointer-events-none'}`}
                        style={{ backgroundColor: 'transparent' } as React.CSSProperties}
                    />

                    {/* Draggable Notes */}
                    {notes.map(n => {
                        const isSelected = n.id === selectedNoteId
                        return (
                        <div
                            key={n.id}
                            className={`absolute border ${isSelected ? 'border-blue-600' : 'border-gray-300'} bg-white shadow-sm`}
                            style={{ left: n.x, top: n.y, width: n.w, height: n.h, cursor: 'move' }}
                            onMouseDown={(e) => startDragNote(e, n.id)}
                        >
                            <div
                            className={`flex items-center justify-between px-2 py-1 text-[11px] ${isSelected ? 'bg-blue-50' : 'bg-gray-50'} select-none`}
                            onMouseDown={(e) => startDragNote(e, n.id)}
                            >
                            <span className="font-medium">Notes</span>
                            <button
                                type="button"
                                className="px-1 py-0.5 border text-[10px] leading-none"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); removeNote(n.id) }}
                                title="Remove note"
                            >
                                remove
                            </button>
                            </div>
                            <textarea
                            className="w-full h-[calc(100%-26px)] p-2 text-[12px] outline-none resize-none bg-transparent"
                            placeholder="Type here..."
                            value={n.text}
                            onMouseDown={(e) => { e.stopPropagation(); setSelectedNoteId(n.id); setSelectedImageId(null) }}
                            onChange={(e) =>
                                setNotes(prev => prev.map(x => x.id === n.id ? { ...x, text: e.target.value } : x))
                            }
                            />
                        </div>
                        )
                    })}
                    </div>
                </div>
                </div>
            </div>

            {/* Certified by band */}
            <div className="border-b border-black text-[11px]">
                <div className="w-full text-center font-semibold py-1 border-b border-black">CERTIFIED BY</div>
                <div className="grid grid-cols-3">
                <div className="border-r border-black p-2">
                    <div className="text-[10px] mb-1">NAME &amp; SIGNATURE</div>
                    <textarea
                    className="w-full border border-gray-300 p-2 text-[12px] outline-none min-h-[96px] resize-y"
                    value={form.certifiedName}
                    onChange={bind('certifiedName')}
                    placeholder="Write name and sign here"
                    />
                </div>
                <div className="border-r border-black p-2">
                    <div className="text-[10px] mb-1">STAMP</div>
                    <textarea
                    className="w-full border border-gray-300 p-2 text-[12px] outline-none min-h-[96px] resize-y"
                    value={form.certifiedStamp}
                    onChange={bind('certifiedStamp')}
                    placeholder="Stamp area"
                    />
                </div>
                <div className="p-2">
                    <div className="text-[10px] mb-1">DATE</div>
                    <input
                    type="date"
                    className="w-full border border-gray-300 p-1 text-[12px] outline-none"
                    value={form.certifiedDate}
                    onChange={bind('certifiedDate')}
                    />
                </div>
                </div>
            </div>

            {/* Statement */}
            <div className="px-2 py-2 text-[10px] leading-4">
                <span className="font-semibold">STATEMENT OF CONFORMITY : </span>
                THIS IS TO CONFIRM THAT THE ABOVE MENTIONED AIRCRAFT/AIRCRAFT COMPONENTS HAVE BEEN INSPECTED IN
                ACCORDANCE WITH THE CURRENT APPLICABLE REFERENCE MANUALS/DOCUMENTS.
            </div>

            {/* Bottom meta row */}
            <div className="px-2 pb-2 text-[10px] text-gray-600 flex items-center justify-between border-t border-black">
                <div>G7A-SOP-NDT(MIL) R2, Issued date 13 NOV 2024</div>
                <div>Page {index + 1} of {totalCount}</div>
            </div>
            </div>
        </div>

        {/* Per-form Remove button */}
        <div className="w-[794px] mt-3 flex flex-wrap items-center justify-center gap-3">
            <button
            type="button"
            onClick={() => {
                if (!canRemove) return
                const ok = window.confirm('Remove this form?')
                if (ok) onRemove()
            }}
            className={`px-4 py-1 border text-[12px] font-semibold transition-colors ${
                canRemove
                ? 'border-red-700 text-red-700 bg-white hover:bg-red-50'
                : 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
            disabled={!canRemove}
            title={canRemove ? 'Remove this form' : 'At least one form must remain'}
            >
            Remove This Form
            </button>
        </div>
        </div>
    )
}
'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"

interface EquipmentRow {
    ndtReportNumber: string
    workOrder: string
    equipmentNumber: string
    description: string
    partNumber: string
    serialNumber: string
    calibrationDue: string
    g7Loan: string
    location: string
    locationbin: string
    quantity: string
    remarks: string
    lastEdit: string
}

    export function TableEquipInventory() {
    const [rows, setRows] = useState<EquipmentRow[]>([])

    // Initial load + live updates
    useEffect(() => {
        setRows(loadInventoryRows())
        const unsub = subscribeInventoryUpdates(() => setRows(loadInventoryRows()))
        return unsub
    }, [])

    const handleChange = (index: number, field: keyof EquipmentRow, value: string) => {
        const updatedRows = [...rows]
        updatedRows[index][field] = value
        setRows(updatedRows)
    }

    const handleAddRow = () => {
        setRows((prev) => [
        ...prev,
        {
            ndtReportNumber: "",
            workOrder: "",
            equipmentNumber: "",
            description: "",
            partNumber: "",
            serialNumber: "",
            calibrationDue: "",
            g7Loan: "",
            location: "",
            locationbin: "",
            quantity: "",
            remarks: "",
            lastEdit: new Date().toISOString(),
        },
        ])
    }

    const handleDeleteRow = (index: number) => {
        const updatedRows = rows.filter((_, i) => i !== index)
        setRows(updatedRows)
        saveInventoryRows(updatedRows)
    }

    const handleSaveAll = () => {
        // update lastEdit for edited rows where it's empty
        const withTimestamps = rows.map(r => ({
        ...r,
        lastEdit: r.lastEdit || new Date().toISOString(),
        }))
        setRows(withTimestamps)
        saveInventoryRows(withTimestamps)
    }

    return (
        <div className="flex flex-1 flex-col gap-10 p-4 pt-0">
        <div className="overflow-x-auto border border-border rounded-lg">
            <Table className="min-w-[1400px]">
            <TableHeader>
                <TableRow>
                <TableHead className="text-center">NDT Report Number</TableHead>
                <TableHead className="text-center">Work Order</TableHead>
                <TableHead className="text-center">Equipment Number</TableHead>
                <TableHead className="text-center">Description</TableHead>
                <TableHead className="text-center">Part Number (P/N)</TableHead>
                <TableHead className="text-center">Serial Number (S/N)</TableHead>
                <TableHead className="text-center">Calibration Due</TableHead>
                <TableHead className="text-center">G7Aero/Loan</TableHead>
                <TableHead className="text-center">Location</TableHead>
                <TableHead className="text-center">Location Bin</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-center">Remarks</TableHead>
                <TableHead className="text-center">Last Edit</TableHead>
                <TableHead className="text-center">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row, index) => (
                <TableRow key={index}>
                    <TableCell>
                    <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={row.ndtReportNumber}
                        onChange={(e) => handleChange(index, "ndtReportNumber", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={row.workOrder}
                        onChange={(e) => handleChange(index, "workOrder", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={row.equipmentNumber}
                        onChange={(e) => handleChange(index, "equipmentNumber", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={row.description}
                        onChange={(e) => handleChange(index, "description", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={row.partNumber}
                        onChange={(e) => handleChange(index, "partNumber", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={row.serialNumber}
                        onChange={(e) => handleChange(index, "serialNumber", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <input
                        type="date"
                        className="w-full border px-2 py-1 rounded"
                        value={row.calibrationDue}
                        onChange={(e) => handleChange(index, "calibrationDue", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <select
                        className="w-full border px-2 py-1 rounded"
                        value={row.g7Loan}
                        onChange={(e) => handleChange(index, "g7Loan", e.target.value)}
                    >
                        <option value="">Select</option>
                        <option value="G7Aero">G7Aero</option>
                        <option value="Loan">Loan</option>
                    </select>
                    </TableCell>
                    <TableCell>
                    <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={row.location}
                        onChange={(e) => handleChange(index, "location", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={row.locationbin}
                        onChange={(e) => handleChange(index, "locationbin", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <input
                        type="number"
                        className="w-full border px-2 py-1 rounded"
                        value={row.quantity}
                        onChange={(e) => handleChange(index, "quantity", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <input
                        type="text"
                        className="w-full border px-2 py-1 rounded"
                        value={row.remarks}
                        onChange={(e) => handleChange(index, "remarks", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <input
                        type="datetime-local"
                        className="w-full border px-2 py-1 rounded"
                        value={
                        // convert ISO to "YYYY-MM-DDTHH:mm" for input display
                        row.lastEdit
                            ? new Date(row.lastEdit).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) => handleChange(index, "lastEdit", e.target.value)}
                    />
                    </TableCell>
                    <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteRow(index)}>
                        Delete
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>

        <div className="flex justify-end pr-4 gap-2">
            <Button onClick={handleAddRow}>+ Add Row</Button>
            <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button onClick={handleSaveAll}>Save Data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Data Stored Successfully</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
        </div>
        </div>
    )
}
function loadInventoryRows(): EquipmentRow[] {
    // Try to load from localStorage, fallback to empty array
    try {
        const data = localStorage.getItem("equipmentInventoryRows")
        if (data) {
            return JSON.parse(data)
        }
    } catch (e) {
        // Ignore errors and fallback
    }
    return []
}
function subscribeInventoryUpdates(callback: () => void): () => void {
    // Listen for changes to localStorage from other tabs/windows
    const handler = (event: StorageEvent) => {
        if (event.key === "equipmentInventoryRows") {
            callback()
        }
    }
    window.addEventListener("storage", handler)
    // Return unsubscribe function
    return () => window.removeEventListener("storage", handler)
}

function saveInventoryRows(rows: EquipmentRow[]): void {
    try {
        localStorage.setItem("equipmentInventoryRows", JSON.stringify(rows))
    } catch (e) {
        // Ignore errors
    }
}


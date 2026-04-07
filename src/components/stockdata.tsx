'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

type StockForm = {
    pic: string
    equipmentNumber: string
    description: string
    serialNumber: string
    partNumber: string
    date: string
    time: string
    quantity: string
}

export function StockData() {
    const [showTabs, setShowTabs] = useState(false)
    const [activeTab, setActiveTab] = useState<"stock_in" | "stock_out">("stock_in")

    const [stockForm, setStockForm] = useState<StockForm>({
        pic: "",
        equipmentNumber: "",
        description: "",
        serialNumber: "",
        partNumber: "",
        date: "",
        time: "",
        quantity: "",
    })

    const onChange = (key: keyof StockForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setStockForm((f) => ({ ...f, [key]: e.target.value }))

    const handleConfirm = () => {
        const nowISO = new Date().toISOString()

        const qty = (stockForm.quantity ?? "").trim()
        const quantity = activeTab === "stock_out" && qty ? (qty.startsWith("-") ? qty : (-Number(qty)).toString()) : qty

        type EquipmentRow = {
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

        const newRow: EquipmentRow = {
            equipmentNumber: stockForm.equipmentNumber,
            description: stockForm.description,
            partNumber: stockForm.partNumber,
            serialNumber: stockForm.serialNumber,

            calibrationDue: "",
            g7Loan: "G7Aero",
            location: "",
            locationbin: "",

            quantity,
            remarks: activeTab === "stock_out"
                ? `OUT by ${stockForm.pic} at ${stockForm.time || "—"}`
                : `IN by ${stockForm.pic} at ${stockForm.time || "—"}`,
            lastEdit: nowISO,
        }

        addInventoryRow(newRow)

        setStockForm((f) => ({
            ...f,
            equipmentNumber: "",
            description: "",
            serialNumber: "",
            partNumber: "",
            date: "",
            time: "",
            quantity: "",
        }))
    }

    return (
        <div className="w-full max-w-screen-sm mx-auto px-4 flex flex-col gap-6">
            <div className="flex justify-center">
                <Button onClick={() => setShowTabs(!showTabs)}>Stock In/Out</Button>
            </div>

            <div className="w-full">
                {showTabs && (
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as "stock_in" | "stock_out")}
                        className="w-full"
                    >
                        <TabsList className="w-full grid grid-cols-2 gap-2 p-1">
                            <TabsTrigger value="stock_in" className="w-full text-sm py-2 data-[state=active]:font-semibold">
                                Stock In
                            </TabsTrigger>
                            <TabsTrigger value="stock_out" className="w-full text-sm py-2 data-[state=active]:font-semibold">
                                Stock Out
                            </TabsTrigger>
                        </TabsList>

                        {/* Stock In */}
                        <TabsContent value="stock_in" className="w-full">
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle>Stock In</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-pic-in">Person In Charge (PIC)</Label>
                                        <Input id="stock-data-pic-in" value={stockForm.pic} onChange={onChange("pic")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-equip-in">Equipment Number</Label>
                                        <Input id="stock-data-equip-in" value={stockForm.equipmentNumber} onChange={onChange("equipmentNumber")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-description-in">Description</Label>
                                        <Input id="stock-data-description-in" value={stockForm.description} onChange={onChange("description")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-serial-in">Serial Number</Label>
                                        <Input id="stock-data-serial-in" value={stockForm.serialNumber} onChange={onChange("serialNumber")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-part-in">Part Number</Label>
                                        <Input id="stock-data-part-in" value={stockForm.partNumber} onChange={onChange("partNumber")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-date-in">Date In</Label>
                                        <Input id="stock-data-date-in" type="date" value={stockForm.date} onChange={onChange("date")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-time-in">Time In</Label>
                                        <Input id="stock-data-time-in" type="time" value={stockForm.time} onChange={onChange("time")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-quantity-in">Quantity</Label>
                                        <Input id="stock-data-quantity-in" type="number" min="0" value={stockForm.quantity} onChange={onChange("quantity")} />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleConfirm}>Confirm</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        {/* Stock Out */}
                        <TabsContent value="stock_out" className="w-full">
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle>Stock Out</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-pic-out">Person In Charge (PIC)</Label>
                                        <Input id="stock-data-pic-out" value={stockForm.pic} onChange={onChange("pic")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-equip-out">Equipment Number</Label>
                                        <Input id="stock-data-equip-out" value={stockForm.equipmentNumber} onChange={onChange("equipmentNumber")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-description-out">Description</Label>
                                        <Input id="stock-data-description-out" value={stockForm.description} onChange={onChange("description")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-serial-out">Serial Number</Label>
                                        <Input id="stock-data-serial-out" value={stockForm.serialNumber} onChange={onChange("serialNumber")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-part-out">Part Number</Label>
                                        <Input id="stock-data-part-out" value={stockForm.partNumber} onChange={onChange("partNumber")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-date-out">Date Out</Label>
                                        <Input id="stock-data-date-out" type="date" value={stockForm.date} onChange={onChange("date")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-time-out">Time Out</Label>
                                        <Input id="stock-data-time-out" type="time" value={stockForm.time} onChange={onChange("time")} />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="stock-data-quantity-out">Quantity</Label>
                                        <Input id="stock-data-quantity-out" type="number" min="0" value={stockForm.quantity} onChange={onChange("quantity")} />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleConfirm}>Confirm</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    )
}

function addInventoryRow(newRow: {
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
}) {
    const key = "inventoryRows"
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]")
    existing.push(newRow)
    localStorage.setItem(key, JSON.stringify(existing))
}

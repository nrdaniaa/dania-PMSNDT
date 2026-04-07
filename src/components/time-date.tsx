'use client'

import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

export function TimeDate() {
    const [time, setTime] = useState<string>("")
    useEffect(() => {
        const interval = setInterval(() => {
        const now = new Date()
        setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-sm">{time}</span>
            </div>
    )
}
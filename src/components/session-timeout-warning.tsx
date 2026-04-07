import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface SessionTimeoutWarningProps {
  isOpen: boolean
  timeLeft: number
}

export function SessionTimeoutWarning({ isOpen, timeLeft }: SessionTimeoutWarningProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <DialogTitle className="text-lg font-semibold">
              Session Timeout Warning
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Your session will expire in <span className="font-mono font-bold text-red-600">{formatTime(timeLeft)}</span> due to inactivity.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          Move your mouse or press any key to continue your session.
        </div>
      </DialogContent>
    </Dialog>
  )
}
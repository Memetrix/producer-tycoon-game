"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number // in ms, default 3000
}

interface ToastNotificationProps {
  toast: Toast
  onClose: (id: string) => void
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10)

    // Auto-dismiss after duration
    const duration = toast.duration || 3000
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(toast.id)
    }, 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return "border-green-500/30"
      case "error":
        return "border-red-500/30"
      case "warning":
        return "border-yellow-500/30"
      case "info":
        return "border-blue-500/30"
    }
  }

  return (
    <Card
      className={`p-4 shadow-lg backdrop-blur-xl transition-all duration-300 ${getBorderColor()} ${
        isVisible && !isExiting
          ? "opacity-100 translate-y-0"
          : isExiting
            ? "opacity-0 -translate-y-4"
            : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{toast.title}</p>
          {toast.message && <p className="text-xs text-muted-foreground mt-1">{toast.message}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose} className="flex-shrink-0 w-6 h-6 -mt-1 -mr-1">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}

// Container for managing multiple toasts
interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-4 right-4 z-[200] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastNotification toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}

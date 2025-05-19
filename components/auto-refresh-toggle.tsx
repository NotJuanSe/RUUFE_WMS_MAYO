"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"
import { useAutoRefresh } from "@/lib/use-auto-refresh"

interface AutoRefreshToggleProps {
  defaultEnabled?: boolean
  interval?: number
  className?: string
}

export function AutoRefreshToggle({
  defaultEnabled = false,
  interval = 30000,
  className = "",
}: AutoRefreshToggleProps) {
  const [enabled, setEnabled] = useState(defaultEnabled)

  // Usar el hook con el estado local
  useAutoRefresh({
    enabled,
    interval,
  })

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch id="auto-refresh" checked={enabled} onCheckedChange={setEnabled} />
      <Label htmlFor="auto-refresh" className="flex items-center cursor-pointer">
        <Clock className="h-4 w-4 mr-2" />
        <span>Actualización automática</span>
      </Label>
    </div>
  )
}

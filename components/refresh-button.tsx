"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

interface RefreshButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function RefreshButton({ className, variant = "outline", size = "icon" }: RefreshButtonProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Refresca los datos
    router.refresh()

    // Simula un tiempo mínimo de carga para feedback visual
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <Button variant={variant} size={size} onClick={handleRefresh} className={className} disabled={isRefreshing}>
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      <span className="sr-only">Actualizar datos</span>
    </Button>
  )
}

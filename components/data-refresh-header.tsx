"use client"

import { RefreshButton } from "@/components/refresh-button"
import { AutoRefreshToggle } from "@/components/auto-refresh-toggle"
import { useState, useEffect } from "react"

interface DataRefreshHeaderProps {
  title: string
  description?: string
  className?: string
}

export function DataRefreshHeader({ title, description, className = "" }: DataRefreshHeaderProps) {
  // Inicializar con null para evitar errores de hidratación
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Actualizar la fecha solo en el cliente después del montaje
  useEffect(() => {
    setLastUpdated(new Date())
  }, [])

  // Formatear la hora de última actualización solo si lastUpdated existe
  const formattedTime = lastUpdated
    ? new Intl.DateTimeFormat("es", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(lastUpdated)
    : "--:--:--"

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="text-gray-600">{description}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="text-sm text-gray-500 flex items-center">
          <span>Última actualización: {formattedTime}</span>
          <RefreshButton className="ml-2" onClick={() => setLastUpdated(new Date())} />
        </div>
        <AutoRefreshToggle defaultEnabled={false} interval={60000} />
      </div>
    </div>
  )
}

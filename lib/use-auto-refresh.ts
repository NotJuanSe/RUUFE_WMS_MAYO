"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface AutoRefreshOptions {
  interval?: number // Intervalo en milisegundos
  enabled?: boolean // Si el auto-refresh está habilitado
  onRefresh?: () => void // Callback opcional cuando ocurre un refresh
}

/**
 * Hook para actualizar automáticamente los datos de la página
 */
export function useAutoRefresh({
  interval = 30000, // 30 segundos por defecto
  enabled = true,
  onRefresh,
}: AutoRefreshOptions = {}) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Función para refrescar los datos
  const refresh = () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    router.refresh()

    if (onRefresh) {
      onRefresh()
    }

    // Resetear el estado después de un tiempo para evitar múltiples refreshes
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  useEffect(() => {
    // Limpiar cualquier timer existente
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Configurar el timer si está habilitado
    if (enabled) {
      timerRef.current = setInterval(refresh, interval)
    }

    // Limpiar al desmontar
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [enabled, interval])

  // Retornar función para refrescar manualmente y estado
  return { refresh, isRefreshing }
}

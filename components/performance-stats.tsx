"use client"

import { useEffect, useState } from "react"
import { getFilteredPerformanceData } from "@/lib/actions"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export function PerformanceStats() {
  const searchParams = useSearchParams()
  const [tiempoPromedio, setTiempoPromedio] = useState(0)
  const [ordenesCompletadas, setOrdenesCompletadas] = useState(0)
  const [eficiencia, setEficiencia] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true)

        // Obtener parámetros de la URL
        const startDate = searchParams.get("startDate") || undefined
        const endDate = searchParams.get("endDate") || undefined
        const clientName = searchParams.get("client") || undefined

        const performanceData = await getFilteredPerformanceData(startDate, endDate, clientName)

        // Calcular estadísticas
        if (performanceData.length > 0) {
          const totalOrders = performanceData.length
          const totalTime = performanceData.reduce((sum, order) => sum + order.duration, 0)
          const totalItems = performanceData.reduce((sum, order) => sum + order.pickedItems, 0)

          setTiempoPromedio(Math.round(totalTime / totalOrders))
          setOrdenesCompletadas(totalOrders)
          setEficiencia(Number.parseFloat((totalItems / totalTime).toFixed(2)) || 0)
        } else {
          setTiempoPromedio(0)
          setOrdenesCompletadas(0)
          setEficiencia(0)
        }
      } catch (err) {
        console.error("Error cargando estadísticas:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [searchParams])

  if (isLoading) {
    return (
      <>
        <div className="card bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
        <div className="card bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
        <div className="card bg-white p-4 rounded-lg shadow-sm border flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="card bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-sm font-medium text-gray-500">Tiempo Promedio</div>
        <div className="text-2xl font-bold">{tiempoPromedio} min</div>
        <div className="text-xs text-gray-500 mt-1">Por orden completada</div>
      </div>

      <div className="card bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-sm font-medium text-gray-500">Órdenes Completadas</div>
        <div className="text-2xl font-bold">{ordenesCompletadas}</div>
        <div className="text-xs text-gray-500 mt-1">En el período seleccionado</div>
      </div>

      <div className="card bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-sm font-medium text-gray-500">Eficiencia</div>
        <div className="text-2xl font-bold">{eficiencia}</div>
        <div className="text-xs text-gray-500 mt-1">Productos por minuto</div>
      </div>
    </>
  )
}

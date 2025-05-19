"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getChartData } from "@/lib/actions"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

// Tipo para los datos del gráfico
type ChartData = {
  fecha: string
  tiempoPromedio: number
  ordenesCompletadas: number
}

export function PerformanceChart() {
  const searchParams = useSearchParams()
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChartData() {
      try {
        setIsLoading(true)
        const data = await getChartData()
        setChartData(data)
        setError(null)
      } catch (err) {
        console.error("Error cargando datos del gráfico:", err)
        setError("Error al cargar los datos. Por favor, intenta de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    loadChartData()
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Cargando datos del gráfico...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <p>No hay suficientes datos para mostrar el gráfico</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fecha" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="tiempoPromedio" name="Tiempo Promedio (min)" fill="#8884d8" />
        <Bar yAxisId="right" dataKey="ordenesCompletadas" name="Órdenes Completadas" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}

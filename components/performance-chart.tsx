"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Datos de ejemplo para el gráfico
const demoData = [
  { fecha: "01/05", tiempoPromedio: 25, ordenesCompletadas: 3 },
  { fecha: "02/05", tiempoPromedio: 18, ordenesCompletadas: 5 },
  { fecha: "03/05", tiempoPromedio: 30, ordenesCompletadas: 2 },
  { fecha: "04/05", tiempoPromedio: 22, ordenesCompletadas: 4 },
  { fecha: "05/05", tiempoPromedio: 15, ordenesCompletadas: 7 },
  { fecha: "06/05", tiempoPromedio: 20, ordenesCompletadas: 3 },
  { fecha: "07/05", tiempoPromedio: 28, ordenesCompletadas: 2 },
]

export function PerformanceChart() {
  const [chartData, setChartData] = useState(demoData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Aquí se cargarían los datos reales desde la API
    // Por ahora usamos los datos de ejemplo
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Cargando datos...</div>
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

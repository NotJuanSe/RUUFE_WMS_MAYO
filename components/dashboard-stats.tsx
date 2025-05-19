"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPickingStats } from "@/lib/actions"

type Stats = {
  pendingOrders: number
  partialOrders: number
  completedOrders: number
  totalProducts: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    pendingOrders: 0,
    partialOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getPickingStats()
        setStats(data)
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard title="Órdenes Pendientes" value={stats.pendingOrders} loading={loading} color="blue" />
      <StatsCard title="Órdenes Parciales" value={stats.partialOrders} loading={loading} color="amber" />
      <StatsCard title="Órdenes Completadas" value={stats.completedOrders} loading={loading} color="green" />
      <StatsCard title="Total Productos" value={stats.totalProducts} loading={loading} color="purple" />
    </div>
  )
}

function StatsCard({
  title,
  value,
  loading,
  color,
}: {
  title: string
  value: number
  loading: boolean
  color: "blue" | "amber" | "green" | "purple"
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  }

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

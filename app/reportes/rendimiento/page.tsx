import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { PerformanceChart } from "@/components/performance-chart"
import { PerformanceTable } from "@/components/performance-table"
import { PerformanceStats } from "@/components/performance-stats"
import { PerformanceFilters } from "@/components/performance-filters"

export default function RendimientoPage() {
  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/reportes" className="flex items-center text-blue-600 hover:text-blue-800 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Reportes
          </Link>
          <h1 className="text-2xl font-bold">Análisis de Rendimiento</h1>
          <p className="text-gray-600">Métricas de rendimiento del proceso de picking</p>
        </div>
      </div>

      <PerformanceFilters />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <PerformanceStats />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Rendimiento por Día</CardTitle>
          <CardDescription>Tiempo promedio y órdenes completadas por día</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <PerformanceChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Detalle de Órdenes</CardTitle>
          <CardDescription>Listado de órdenes completadas con métricas de rendimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceTable />
        </CardContent>
      </Card>
    </main>
  )
}

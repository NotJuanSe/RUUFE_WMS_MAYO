import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, ClipboardList, Clock, FileText } from "lucide-react"
import { getPickingStats } from "@/lib/actions"

export default async function ReportesPage() {
  const stats = await getPickingStats()

  return (
    <div className="flex min-h-screen flex-col p-6 md:p-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-gray-600">Análisis y reportes del sistema de picking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Parciales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.partialOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Rendimiento</CardTitle>
            <CardDescription>Analiza el rendimiento del proceso de picking, tiempos y eficiencia</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-4">
              <Clock className="h-16 w-16 text-blue-500" />
            </div>
            <p className="text-center mb-4">
              Visualiza métricas de rendimiento, tiempos promedio y eficiencia del proceso de picking
            </p>
            <Link href="/reportes/rendimiento">
              <Button className="w-full">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Análisis
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reporte de Faltantes</CardTitle>
            <CardDescription>Gestiona los productos faltantes en pickings parciales</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-4">
              <ClipboardList className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-center mb-4">
              Genera órdenes de compra para productos faltantes y completa pickings parciales
            </p>
            <Link href="/reportes/faltantes">
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Ver Faltantes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

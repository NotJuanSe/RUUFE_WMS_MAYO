"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPickingOrderById } from "@/lib/actions"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Clock, Download, BarChart3 } from "lucide-react"

export default function RendimientoDetallePage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await getPickingOrderById(params.id)
        if (!data) {
          notFound()
        }
        setOrder(data)
      } catch (error) {
        console.error("Error loading order:", error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [params.id])

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
        <div className="flex justify-center items-center h-full">
          <p>Cargando datos de la orden...</p>
        </div>
      </main>
    )
  }

  if (!order) {
    notFound()
  }

  // Calcular estadísticas
  const totalItems = order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)
  const pickedItems = order.items.reduce((acc: number, item: any) => acc + item.picked, 0)
  const progress = Math.round((pickedItems / totalItems) * 100)

  // Calcular tiempo de picking (simulado)
  const startTime = new Date(order.createdAt)
  const endTime = order.completedAt ? new Date(order.completedAt) : new Date()
  const durationMs = endTime.getTime() - startTime.getTime()
  const durationMinutes = Math.round(durationMs / (1000 * 60))
  const itemsPerMinute = durationMinutes > 0 ? (pickedItems / durationMinutes).toFixed(2) : "0.00"

  // Formatear fechas
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/reportes/rendimiento" className="flex items-center text-blue-600 hover:text-blue-800 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Rendimiento
          </Link>
          <h1 className="text-2xl font-bold">Análisis de Rendimiento: {order.clientName}</h1>
          <p className="text-gray-600">
            Factura: {order.invoiceNumber} | Fecha: {formatDate(order.createdAt)}
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Picking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold">{durationMinutes} min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pickedItems}/{totalItems}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">{itemsPerMinute}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Productos por minuto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {order.status === "completed" ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completado</Badge>
              ) : order.status === "partial" ? (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Parcial</Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pendiente</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inicio de Picking:</span>
                <span className="font-medium">{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fin de Picking:</span>
                <span className="font-medium">
                  {order.completedAt ? formatDateTime(order.completedAt) : "En proceso"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duración Total:</span>
                <span className="font-medium">{durationMinutes} minutos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tiempo por Producto:</span>
                <span className="font-medium">
                  {pickedItems > 0 ? (durationMinutes / pickedItems).toFixed(2) : "0.00"} min/producto
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Productos:</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Productos Recogidos:</span>
                <span className="font-medium">{pickedItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Productos Faltantes:</span>
                <span className="font-medium">{totalItems - pickedItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Eficiencia:</span>
                <span className="font-medium">{itemsPerMinute} productos/minuto</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Productos</CardTitle>
          <CardDescription>Productos incluidos en la orden de picking</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Recogidos</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.product}</TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.picked}</TableCell>
                    <TableCell>
                      {item.picked === item.quantity ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completo</Badge>
                      ) : item.picked > 0 ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Parcial</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Faltante</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

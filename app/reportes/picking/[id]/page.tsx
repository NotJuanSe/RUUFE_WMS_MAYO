"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPickingOrderById } from "@/lib/actions"
import { formatDate } from "@/lib/utils"
import { CheckCircle, Printer } from "lucide-react"

export default async function PickingReportPage({ params }: { params: { id: string } }) {
  const orderId = params.id
  const order = await getPickingOrderById(orderId)

  if (!order) {
    notFound()
  }

  // Calcular estadísticas
  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)
  const pickedItems = order.items.reduce((acc, item) => acc + item.picked, 0)
  const progress = Math.round((pickedItems / totalItems) * 100)

  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reporte de Picking: {order.clientName}</h1>
          <p className="text-gray-600">
            Factura: {order.invoiceNumber} | Cliente: {order.clientName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Link href="/picking/completadas">
            <Button variant="outline">Volver</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-lg font-bold text-green-700">Completado</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fecha de Creación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(order.createdAt)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {pickedItems}/{totalItems} ({progress}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Marcas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{new Set(order.items.map((item) => item.brand)).size}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Detalle de Productos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código de Barras
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.barcode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.picked}/{item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.picked === item.quantity ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completo</Badge>
                      ) : item.picked > 0 ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Parcial</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Faltante</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen por Marca</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos Totales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos Recogidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(
                  order.items.reduce(
                    (acc, item) => {
                      if (!acc[item.brand]) {
                        acc[item.brand] = { total: 0, picked: 0 }
                      }
                      acc[item.brand].total += item.quantity
                      acc[item.brand].picked += item.picked
                      return acc
                    },
                    {} as Record<string, { total: number; picked: number }>,
                  ),
                ).map(([brand, { total, picked }]) => (
                  <tr key={brand}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{picked}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${Math.round((picked / total) * 100)}%` }}
                          ></div>
                        </div>
                        <span>{Math.round((picked / total) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

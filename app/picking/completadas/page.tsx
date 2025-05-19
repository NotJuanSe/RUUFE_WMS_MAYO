import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCompletedPickingOrders } from "@/lib/actions"
import { formatDate } from "@/lib/utils"

export default async function CompletedPickingOrders() {
  const orders = await getCompletedPickingOrders()

  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Órdenes de Picking Completadas</h1>
          <p className="text-gray-600">Órdenes que han sido completamente procesadas</p>
        </div>
        <Link href="/">
          <Button variant="outline">Volver al Inicio</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">No hay órdenes completadas</h3>
            <p className="mt-1 text-gray-500">No hay órdenes completadas en este momento.</p>
          </div>
          <Link href="/" className="mt-6">
            <Button>Volver al Inicio</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow border-green-200">
                <CardHeader className="pb-2 bg-green-50">
                  <CardTitle className="flex justify-between items-center">
                    <span>Orden {order.invoiceNumber || `#${order.id.substring(order.id.length - 5)}`}</span>
                    <span className="text-sm bg-green-100 text-green-800 py-1 px-2 rounded-full">Completada</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cliente:</span>
                      <span className="font-medium">{order.clientName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Factura:</span>
                      <span className="font-medium">{order.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fecha:</span>
                      <span className="font-medium">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Productos:</span>
                      <span className="font-medium">{totalItems} productos</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completada:</span>
                      <span className="font-medium">{order.completedAt ? formatDate(order.completedAt) : "N/A"}</span>
                    </div>
                  </div>
                  <Link href={`/reportes/picking/${order.id}`} className="w-full">
                    <Button className="w-full bg-green-600 hover:bg-green-700">Ver Reporte</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}

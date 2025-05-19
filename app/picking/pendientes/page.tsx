import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPendingPickingOrders } from "@/lib/actions"
import { formatDate } from "@/lib/utils"

export default async function PendingPickingOrders() {
  const orders = await getPendingPickingOrders()

  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Órdenes de Picking Pendientes</h1>
          <p className="text-gray-600">Selecciona una orden para comenzar el proceso de picking</p>
        </div>
        <Link href="/">
          <Button variant="outline">Volver al Inicio</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">No hay órdenes pendientes</h3>
            <p className="mt-1 text-gray-500">
              Todas las órdenes han sido procesadas o no se han cargado nuevas órdenes.
            </p>
          </div>
          <Link href="/" className="mt-6">
            <Button>Volver al Inicio</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Orden {order.invoiceNumber || `#${order.id.substring(order.id.length - 5)}`}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                    {order.itemCount} productos
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                </div>
                <Link href={`/picking/proceso/${order.id}`} className="w-full">
                  <Button className="w-full">Iniciar Picking</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}

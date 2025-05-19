import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataRefreshHeader } from "@/components/data-refresh-header"
import { getCompletedPickingOrders } from "@/lib/actions"
import { formatDate } from "@/lib/utils"
import { CheckCircle, Eye } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CompletedPickingPage() {
  const orders = await getCompletedPickingOrders()

  return (
    <main className="flex min-h-screen flex-col p-6">
      <DataRefreshHeader
        title="Órdenes Completadas"
        description="Visualiza las órdenes de picking que han sido completadas."
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes completadas</h3>
            <p className="text-gray-500">Las órdenes completadas aparecerán aquí.</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-green-50 border-b border-green-100 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.clientName}</CardTitle>
                    <p className="text-sm text-gray-500">Factura: {order.invoiceNumber}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completada</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fecha de creación:</span>
                    <span className="font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Productos:</span>
                    <span className="font-medium">{order._count?.items || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estado:</span>
                    <span className="flex items-center text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completada
                    </span>
                  </div>
                  <div className="pt-3 flex justify-end">
                    <Link href={`/picking/proceso/${order.id}`} prefetch={false}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Orden
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  )
}

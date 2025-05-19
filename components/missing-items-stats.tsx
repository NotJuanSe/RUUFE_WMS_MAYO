import { getMissingItems } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function MissingItemsStats() {
  const { stats } = await getMissingItems()

  // Formatear el valor estimado como moneda colombiana
  const formattedValue = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(stats.estimatedValue)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Productos Faltantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMissingItems}</div>
          <p className="text-xs text-gray-500 mt-1">En todas las órdenes parciales</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Órdenes Parciales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPartialOrders}</div>
          <p className="text-xs text-gray-500 mt-1">Pendientes de completar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedValue}</div>
          <p className="text-xs text-gray-500 mt-1">De productos faltantes</p>
        </CardContent>
      </Card>
    </div>
  )
}

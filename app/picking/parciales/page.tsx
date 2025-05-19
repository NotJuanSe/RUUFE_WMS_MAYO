import { getPartialPickingOrders } from "@/lib/actions"
import { OptimisticPickingList } from "@/components/optimistic-picking-list"
import { DataRefreshHeader } from "@/components/data-refresh-header"

export default async function PartialPickingPage() {
  const orders = await getPartialPickingOrders()

  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <DataRefreshHeader
        title="Órdenes Parciales"
        description="Gestiona las órdenes de picking parcialmente completadas"
        className="mb-6"
      />

      <OptimisticPickingList
        initialOrders={orders}
        type="partial"
        refreshInterval={30000} // 30 segundos
      />
    </main>
  )
}

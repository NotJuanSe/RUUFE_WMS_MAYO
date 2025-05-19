import { getPendingPickingOrders } from "@/lib/actions"
import { OptimisticPickingList } from "@/components/optimistic-picking-list"
import { DataRefreshHeader } from "@/components/data-refresh-header"

export default async function PendingPickingPage() {
  const orders = await getPendingPickingOrders()

  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <DataRefreshHeader
        title="Órdenes Pendientes"
        description="Gestiona las órdenes de picking pendientes"
        className="mb-6"
      />

      <OptimisticPickingList
        initialOrders={orders}
        type="pending"
        refreshInterval={30000} // 30 segundos
      />
    </main>
  )
}

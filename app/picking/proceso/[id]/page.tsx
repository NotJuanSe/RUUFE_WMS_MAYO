import { notFound } from "next/navigation"
import { PickingProcess } from "@/components/picking-process"
import { getPickingOrderById } from "@/lib/actions"

export default async function PickingProcessPage({ params }: { params: { id: string } }) {
  const orderId = params.id
  const order = await getPickingOrderById(orderId)

  if (!order) {
    notFound()
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <PickingProcess order={order} />
    </main>
  )
}

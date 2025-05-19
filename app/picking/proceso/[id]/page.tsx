import { notFound } from "next/navigation"
import { PickingProcess } from "@/components/picking-process"
import { getPickingOrderById } from "@/lib/actions"

interface PageProps {
  params: {
    id: string
  }
}

export default async function PickingProcessPage(props: PageProps) {
  // Destructure the id outside of the async flow
  const id = String(props.params?.id || "")

  if (!id) {
    notFound()
  }

  try {
    // Use the extracted id instead of directly accessing params.id
    const order = await getPickingOrderById(id)

    if (!order) {
      notFound()
    }

    return (
      <main className="flex min-h-screen flex-col bg-gray-50">
        <PickingProcess order={order} />
      </main>
    )
  } catch (error) {
    console.error("Error loading order:", error)
    notFound()
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get("ids")

    // Obtener todas las órdenes parciales
    const partialOrders = await prisma.pickingOrder.findMany({
      where: { status: "partial" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Mapear los productos faltantes
    const missingItemsMap = new Map()

    partialOrders.forEach((order) => {
      order.items.forEach((item) => {
        // Si hay productos faltantes (picked < quantity)
        if (item.picked < item.quantity) {
          const missingQuantity = item.quantity - item.picked
          const productId = item.product.id

          // Si se proporcionaron IDs específicos, filtrar por ellos
          if (ids && ids.length > 0 && !ids.split(",").includes(productId)) {
            return
          }

          if (!missingItemsMap.has(productId)) {
            missingItemsMap.set(productId, {
              id: productId,
              code: item.product.codigoRUUFE,
              product: item.product.producto,
              brand: item.product.marca,
              barcode: item.product.barcode || item.product.codigoRUUFE,
              quantity: 0,
              price: item.product.precioCOP || 0,
              orders: [],
            })
          }

          const missingItem = missingItemsMap.get(productId)
          missingItem.quantity += missingQuantity

          // Agregar la orden a la lista de órdenes que necesitan este producto
          if (!missingItem.orders.some((o: any) => o.id === order.id)) {
            missingItem.orders.push({
              id: order.id,
              invoiceNumber: order.invoiceNumber,
              clientName: order.clientName,
            })
          }
        }
      })
    })

    // Convertir el mapa a un array
    const missingItems = Array.from(missingItemsMap.values())

    return NextResponse.json({ success: true, items: missingItems })
  } catch (error) {
    console.error("Error fetching missing items:", error)
    return NextResponse.json({ success: false, error: "Error al obtener los productos faltantes" }, { status: 500 })
  }
}

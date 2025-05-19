"use server"

import { revalidatePath } from "next/cache"
import { parse } from "node-html-parser"
import { prisma } from "@/lib/prisma"
import type { OrderStatus } from "@prisma/client"

// Función para procesar el HTML de la cuenta de cobro y crear una orden de picking
export async function createPickingOrder(htmlContent: string) {
  try {
    // Parsear el HTML
    const root = parse(htmlContent)

    // Extraer información de la factura
    const invoiceNumber = root.querySelector(".invoice-details p:nth-child(1) .detail-value")?.text.trim() || ""
    const clientName = root.querySelector(".invoice-details p:nth-child(3) .detail-value")?.text.trim() || ""

    // Verificar si ya existe una orden con este número de factura
    const existingOrder = await prisma.pickingOrder.findUnique({
      where: { invoiceNumber },
    })

    if (existingOrder) {
      return {
        success: false,
        error: `Ya existe una orden de picking para la factura ${invoiceNumber}`,
      }
    }

    // Extraer productos de la tabla
    const rows = root.querySelectorAll("table tbody tr")
    if (!rows.length) {
      return {
        success: false,
        error: "No se encontraron productos en la cuenta de cobro",
      }
    }

    // Crear la orden de picking
    const order = await prisma.pickingOrder.create({
      data: {
        invoiceNumber,
        clientName,
        status: "pending",
      },
    })

    // Procesar cada producto y crear los items de picking
    for (const row of rows) {
      const cells = row.querySelectorAll("td")
      const code = cells[0]?.text.trim() || ""
      const brand = cells[1]?.text.trim() || ""
      const productName = cells[2]?.text.trim() || ""
      const quantity = Number.parseInt(cells[3]?.text.trim() || "0", 10)

      // Buscar el producto en la base de datos
      let product = await prisma.product.findUnique({
        where: { codigoRUUFE: code },
      })

      // Si el producto no existe, lo creamos con información básica
      if (!product) {
        product = await prisma.product.create({
          data: {
            codigoRUUFE: code,
            producto: productName,
            marca: brand,
            precioCOP: 0,
            usdCost: 0,
            rrp: 0,
            pesoGR: 0,
          },
        })
      }

      // Crear el item de picking
      await prisma.pickingItem.create({
        data: {
          quantity,
          orderId: order.id,
          productId: product.id,
        },
      })
    }

    // Obtener el número de items creados
    const itemCount = await prisma.pickingItem.count({
      where: { orderId: order.id },
    })

    // Revalidar todas las rutas que podrían verse afectadas
    revalidatePath("/")
    revalidatePath("/picking/pendientes")
    revalidatePath("/picking/parciales")
    revalidatePath("/picking/completadas")

    return {
      success: true,
      orderId: order.id,
      itemCount,
    }
  } catch (error) {
    console.error("Error creating picking order:", error)
    return {
      success: false,
      error: "Error al procesar el archivo HTML",
    }
  }
}

// Función para obtener estadísticas de picking
export async function getPickingStats() {
  try {
    const [pendingOrders, partialOrders, completedOrders] = await Promise.all([
      prisma.pickingOrder.count({
        where: { status: "pending" },
      }),
      prisma.pickingOrder.count({
        where: { status: "partial" },
      }),
      prisma.pickingOrder.count({
        where: { status: "completed" },
      }),
    ])

    // Contar el total de productos en todas las órdenes
    const totalProducts = await prisma.pickingItem.aggregate({
      _sum: {
        quantity: true,
      },
    })

    return {
      pendingOrders,
      partialOrders,
      completedOrders,
      totalProducts: totalProducts._sum.quantity || 0,
    }
  } catch (error) {
    console.error("Error getting picking stats:", error)
    return {
      pendingOrders: 0,
      partialOrders: 0,
      completedOrders: 0,
      totalProducts: 0,
    }
  }
}

// Función para obtener órdenes de picking pendientes
export async function getPendingPickingOrders() {
  try {
    const orders = await prisma.pickingOrder.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { items: true },
        },
      },
    })

    return orders.map((order) => ({
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      clientName: order.clientName,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      itemCount: order._count.items,
    }))
  } catch (error) {
    console.error("Error getting pending picking orders:", error)
    return []
  }
}

// Función para obtener órdenes de picking parciales
export async function getPartialPickingOrders() {
  try {
    const orders = await prisma.pickingOrder.findMany({
      where: { status: "partial" },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return orders.map((order) => ({
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      clientName: order.clientName,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      completedAt: order.completedAt ? order.completedAt.toISOString() : null,
      items: order.items.map((item) => ({
        id: item.id,
        code: item.product.codigoRUUFE,
        brand: item.product.marca,
        product: item.product.producto,
        quantity: item.quantity,
        barcode: item.product.barcode || item.product.codigoRUUFE,
        picked: item.picked,
      })),
    }))
  } catch (error) {
    console.error("Error getting partial picking orders:", error)
    return []
  }
}

// Función para obtener órdenes de picking completadas
export async function getCompletedPickingOrders() {
  try {
    const orders = await prisma.pickingOrder.findMany({
      where: { status: "completed" },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return orders.map((order) => ({
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      clientName: order.clientName,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      completedAt: order.completedAt ? order.completedAt.toISOString() : null,
      items: order.items.map((item) => ({
        id: item.id,
        code: item.product.codigoRUUFE,
        brand: item.product.marca,
        product: item.product.producto,
        quantity: item.quantity,
        barcode: item.product.barcode || item.product.codigoRUUFE,
        picked: item.picked,
      })),
    }))
  } catch (error) {
    console.error("Error getting completed picking orders:", error)
    return []
  }
}

// Función para obtener una orden de picking por ID
export async function getPickingOrderById(id: string) {
  try {
    const order = await prisma.pickingOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return null
    }

    // Transformar los datos para mantener compatibilidad con la interfaz actual
    return {
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      clientName: order.clientName,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        code: item.product.codigoRUUFE,
        brand: item.product.marca,
        product: item.product.producto,
        quantity: item.quantity,
        barcode: item.product.barcode || item.product.codigoRUUFE,
        picked: item.picked,
      })),
    }
  } catch (error) {
    console.error(`Error getting picking order ${id}:`, error)
    return null
  }
}

// Función para actualizar una orden de picking
export async function updatePickingOrder(
  id: string,
  items: Array<{ id: string; picked: number }>,
  status: "partial" | "completed",
) {
  try {
    // Iniciar una transacción para actualizar todo de forma atómica
    return await prisma.$transaction(async (tx) => {
      // Actualizar cada item con la cantidad recogida
      for (const item of items) {
        await tx.pickingItem.update({
          where: { id: item.id },
          data: { picked: item.picked },
        })
      }

      // Actualizar el estado de la orden
      await tx.pickingOrder.update({
        where: { id },
        data: {
          status: status as OrderStatus,
          completedAt: status === "completed" ? new Date() : null,
        },
      })

      // Revalidar todas las rutas que podrían verse afectadas
      revalidatePath("/")
      revalidatePath("/picking/pendientes")
      revalidatePath("/picking/parciales")
      revalidatePath("/picking/completadas")
      revalidatePath(`/picking/proceso/${id}`)
      revalidatePath(`/reportes/picking/${id}`)
      revalidatePath("/reportes/faltantes")

      return { success: true }
    })
  } catch (error) {
    console.error(`Error updating picking order ${id}:`, error)
    throw error
  }
}

// Función para cargar productos desde Excel
export async function uploadProducts(productsData: { [key: string]: any[] }) {
  try {
    // Aplanar los datos para tener una lista de todos los productos
    const allProducts = Object.entries(productsData).flatMap(([marca, productos]) =>
      productos.map((producto) => ({
        ...producto,
        marca,
      })),
    )

    // Usar una transacción para asegurar que todo se guarda correctamente
    const result = await prisma.$transaction(async (tx) => {
      let created = 0
      let updated = 0

      for (const product of allProducts) {
        // Buscar si el producto ya existe
        const existingProduct = await tx.product.findUnique({
          where: { codigoRUUFE: product.codigoRUUFE },
        })

        if (existingProduct) {
          // Actualizar producto existente
          await tx.product.update({
            where: { id: existingProduct.id },
            data: {
              barcode: product.barcode || existingProduct.barcode,
              producto: product.producto || existingProduct.producto,
              precioCOP: product.precioCOP || existingProduct.precioCOP,
              usdCost: product.usdCost || existingProduct.usdCost,
              rrp: product.rrp || existingProduct.rrp,
              pesoGR: product.pesoGR || existingProduct.pesoGR,
              marca: product.marca || existingProduct.marca,
            },
          })
          updated++
        } else {
          // Crear nuevo producto
          await tx.product.create({
            data: {
              codigoRUUFE: product.codigoRUUFE,
              barcode: product.barcode || "",
              producto: product.producto || "",
              precioCOP: product.precioCOP || 0,
              usdCost: product.usdCost || 0,
              rrp: product.rrp || 0,
              pesoGR: product.pesoGR || 0,
              marca: product.marca || "",
            },
          })
          created++
        }
      }

      return {
        count: allProducts.length,
        created,
        updated,
      }
    })

    revalidatePath("/productos")

    return {
      success: true,
      count: result.count,
      created: result.created,
      updated: result.updated,
    }
  } catch (error) {
    console.error("Error uploading products:", error)
    return {
      success: false,
      error: "Error al cargar los productos en la base de datos",
    }
  }
}

// Función para obtener todos los productos
export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { marca: "asc" },
    })

    return products
  } catch (error) {
    console.error("Error getting products:", error)
    return []
  }
}

// Función para obtener un producto por ID
export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    return product
  } catch (error) {
    console.error(`Error getting product ${id}:`, error)
    return null
  }
}

// Función para actualizar un producto
export async function updateProduct(id: string, data: any) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
    })

    revalidatePath(`/productos/${id}`)
    revalidatePath("/productos")

    return { success: true, product }
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    return { success: false, error: "Error al actualizar el producto" }
  }
}

// Función para eliminar un producto
export async function deleteProduct(id: string) {
  try {
    // Verificar si el producto está siendo usado en alguna orden
    const usedInOrders = await prisma.pickingItem.findFirst({
      where: { productId: id },
    })

    if (usedInOrders) {
      return {
        success: false,
        error: "No se puede eliminar el producto porque está siendo usado en órdenes de picking",
      }
    }

    await prisma.product.delete({
      where: { id },
    })

    revalidatePath("/productos")

    return { success: true }
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    return { success: false, error: "Error al eliminar el producto" }
  }
}

// Función para obtener productos faltantes en órdenes parciales
export async function getMissingItems() {
  try {
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

          if (!missingItemsMap.has(productId)) {
            missingItemsMap.set(productId, {
              id: productId,
              code: item.product.codigoRUUFE,
              product: item.product.producto,
              brand: item.product.marca,
              barcode: item.product.barcode || item.product.codigoRUUFE,
              quantity: 0,
              price: item.product.precioCOP,
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

    // Obtener estadísticas
    const totalMissingItems = missingItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalPartialOrders = partialOrders.length

    // Calcular valor estimado usando precioCOP
    const estimatedValue = missingItems.reduce((sum, item) => {
      return sum + (item.price ? item.price * item.quantity : 0)
    }, 0)

    return {
      missingItems,
      partialOrders: partialOrders.map((order) => {
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
        const pickedItems = order.items.reduce((sum, item) => sum + item.picked, 0)
        const missingItems = totalItems - pickedItems
        const progress = Math.round((pickedItems / totalItems) * 100)

        return {
          id: order.id,
          invoiceNumber: order.invoiceNumber,
          clientName: order.clientName,
          createdAt: order.createdAt.toISOString(),
          missingItems,
          totalItems,
          progress,
        }
      }),
      stats: {
        totalMissingItems,
        totalPartialOrders,
        estimatedValue,
      },
    }
  } catch (error) {
    console.error("Error getting missing items:", error)
    return {
      missingItems: [],
      partialOrders: [],
      stats: {
        totalMissingItems: 0,
        totalPartialOrders: 0,
        estimatedValue: 0,
      },
    }
  }
}

export async function getPickingOrders() {
  try {
    const orders = await prisma.pickingOrder.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transformar los datos para que coincidan con el formato esperado por la tabla
    return orders.map((order) => {
      // Calcular la duración en minutos
      const startTime = order.createdAt.toISOString()
      const endTime = order.completedAt ? order.completedAt.toISOString() : new Date().toISOString()

      const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime()
      const durationMinutes = Math.round(durationMs / (1000 * 60))

      // Calcular el total de productos y productos recogidos
      const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
      const pickedItems = order.items.reduce((sum, item) => sum + item.picked, 0)

      // Calcular la eficiencia (productos por minuto)
      const itemsPerMinute = durationMinutes > 0 ? pickedItems / durationMinutes : 0

      return {
        id: order.id,
        invoiceNumber: order.invoiceNumber,
        clientName: order.clientName,
        startTime,
        endTime,
        duration: durationMinutes,
        itemsCount,
        pickedItems,
        itemsPerMinute,
        status: order.status,
      }
    })
  } catch (error) {
    console.error("Error al obtener órdenes:", error)
    return []
  }
}

// Añadir esta función a tu archivo actions.ts existente

// Función para obtener datos para el gráfico de rendimiento agrupados por fecha
export async function getChartData() {
  try {
    // Obtener todas las órdenes completadas
    const completedOrders = await prisma.pickingOrder.findMany({
      where: {
        status: "completed",
        completedAt: { not: null },
      },
      include: {
        items: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    })

    // Agrupar órdenes por fecha
    const ordersByDate = completedOrders.reduce(
      (acc, order) => {
        // Formatear la fecha como DD/MM
        const completedDate = order.completedAt!
        const dateKey = `${completedDate.getDate().toString().padStart(2, "0")}/${(completedDate.getMonth() + 1).toString().padStart(2, "0")}`

        // Calcular duración en minutos
        const durationMs = completedDate.getTime() - order.createdAt.getTime()
        const durationMinutes = Math.round(durationMs / (1000 * 60))

        // Si la fecha no existe en el acumulador, inicializarla
        if (!acc[dateKey]) {
          acc[dateKey] = {
            totalTime: 0,
            orderCount: 0,
          }
        }

        // Acumular datos
        acc[dateKey].totalTime += durationMinutes
        acc[dateKey].orderCount += 1

        return acc
      },
      {} as Record<string, { totalTime: number; orderCount: number }>,
    )

    // Convertir el objeto agrupado a un array para el gráfico
    const chartData = Object.entries(ordersByDate).map(([fecha, data]) => {
      return {
        fecha,
        tiempoPromedio: Math.round(data.totalTime / data.orderCount),
        ordenesCompletadas: data.orderCount,
      }
    })

    // Ordenar por fecha (asumiendo formato DD/MM)
    chartData.sort((a, b) => {
      const [dayA, monthA] = a.fecha.split("/").map(Number)
      const [dayB, monthB] = b.fecha.split("/").map(Number)

      if (monthA !== monthB) return monthA - monthB
      return dayA - dayB
    })

    // Limitar a los últimos 7 días con datos
    return chartData.slice(-7)
  } catch (error) {
    console.error("Error al obtener datos para el gráfico:", error)
    return []
  }
}

// Función para obtener la lista de clientes únicos
export async function getUniqueClients() {
  try {
    const clients = await prisma.pickingOrder.findMany({
      select: {
        clientName: true,
      },
      distinct: ["clientName"],
      orderBy: {
        clientName: "asc",
      },
    })

    return clients.map((client) => client.clientName)
  } catch (error) {
    console.error("Error al obtener la lista de clientes:", error)
    return []
  }
}

// Función para obtener datos de rendimiento filtrados
export async function getFilteredPerformanceData(startDate?: string, endDate?: string, clientName?: string) {
  try {
    // Construir el objeto de filtro
    const where: any = {
      status: "completed",
      completedAt: { not: null },
    }

    // Añadir filtros de fecha si están presentes
    if (startDate) {
      where.completedAt = {
        ...where.completedAt,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      const endDateObj = new Date(endDate)
      endDateObj.setHours(23, 59, 59, 999) // Establecer al final del día
      where.completedAt = {
        ...where.completedAt,
        lte: endDateObj,
      }
    }

    // Añadir filtro de cliente si está presente
    if (clientName && clientName !== "all") {
      where.clientName = clientName
    }

    // Obtener las órdenes filtradas
    const pickingOrders = await prisma.pickingOrder.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    })

    // Transformar los datos para el formato de la tabla de rendimiento
    return pickingOrders.map((order) => {
      const startTime = order.createdAt.toISOString()
      const endTime = order.completedAt!.toISOString()
      const durationMs = order.completedAt!.getTime() - order.createdAt.getTime()
      const duration = Math.round(durationMs / (1000 * 60)) // Duration in minutes
      const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
      const pickedItems = order.items.reduce((sum, item) => sum + item.picked, 0)
      const itemsPerMinute = duration > 0 ? Number.parseFloat((pickedItems / duration).toFixed(2)) : 0

      return {
        id: order.id,
        invoiceNumber: order.invoiceNumber,
        clientName: order.clientName,
        startTime,
        endTime,
        duration,
        itemsCount,
        pickedItems,
        itemsPerMinute,
      }
    })
  } catch (error) {
    console.error("Error al obtener datos de rendimiento filtrados:", error)
    return []
  }
}
// Simulación de una base de datos para el ejemplo
// En un entorno real, usarías una base de datos como PostgreSQL, MySQL o MongoDB

import { generateId } from "@/lib/utils"

type PickingItem = {
  id: string
  code: string
  brand: string
  product: string
  quantity: number
  barcode: string
  picked: number
}

type PickingOrder = {
  id: string
  invoiceNumber: string
  clientName: string
  status: "pending" | "partial" | "completed"
  createdAt: string
  completedAt: string | null
  items: PickingItem[]
}

type Product = {
  id: string
  codigoRUUFE: string
  barcode: string
  producto: string
  precioCOP: number
  usdCost: number
  rrp: number
  pesoGR: number
  marca: string
}

// Datos de ejemplo
const pickingOrders: PickingOrder[] = [
  {
    id: "pick_1",
    invoiceNumber: "RUM202505090921",
    clientName: "Cliente de Ejemplo",
    status: "pending",
    createdAt: new Date().toISOString(),
    completedAt: null,
    items: [
      {
        id: "item_1",
        code: "A2",
        brand: "RITUAL-BOTANICO",
        product: "KERATINA ORGANICA 250ML R-BOTANICO",
        quantity: 2,
        barcode: "A2",
        picked: 0,
      },
      {
        id: "item_2",
        code: "A3",
        brand: "RITUAL-BOTANICO",
        product: "KERATINA ORGANICA LITRO R-BOTANICO",
        quantity: 2,
        barcode: "A3",
        picked: 0,
      },
    ],
  },
]

// Datos de productos
const products: Product[] = [
  {
    id: "prod_1",
    codigoRUUFE: "A2",
    barcode: "7861234567890",
    producto: "KERATINA ORGANICA 250ML R-BOTANICO",
    precioCOP: 45000,
    usdCost: 12.5,
    rrp: 25.0,
    pesoGR: 280,
    marca: "RITUAL-BOTANICO",
  },
  {
    id: "prod_2",
    codigoRUUFE: "A3",
    barcode: "7861234567891",
    producto: "KERATINA ORGANICA LITRO R-BOTANICO",
    precioCOP: 120000,
    usdCost: 35.0,
    rrp: 70.0,
    pesoGR: 1050,
    marca: "RITUAL-BOTANICO",
  },
]

// Simulación de operaciones CRUD
export const db = {
  pickingOrder: {
    findMany: async (options?: any) => {
      let result = [...pickingOrders]

      // Filtrar por status si se especifica
      if (options?.where?.status) {
        result = result.filter((order) => order.status === options.where.status)
      }

      // Ordenar si se especifica
      if (options?.orderBy?.createdAt) {
        result.sort((a, b) => {
          if (options.orderBy.createdAt === "desc") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        })
      }

      // Seleccionar campos específicos
      if (options?.select) {
        return result.map((order) => {
          const selected: any = {}
          for (const key in options.select) {
            if (options.select[key]) {
              selected[key] = (order as any)[key]
            }
          }
          return selected
        })
      }

      return result
    },

    findUnique: async (options: any) => {
      return pickingOrders.find((order) => order.id === options.where.id) || null
    },

    findFirst: async (options: any) => {
      return pickingOrders.find((order) => order.invoiceNumber === options.where.invoiceNumber) || null
    },

    create: async (options: any) => {
      const newOrder = {
        ...options.data,
        createdAt: new Date().toISOString(),
        completedAt: null,
      }
      pickingOrders.push(newOrder)
      return newOrder
    },

    update: async (options: any) => {
      const index = pickingOrders.findIndex((order) => order.id === options.where.id)
      if (index !== -1) {
        pickingOrders[index] = {
          ...pickingOrders[index],
          ...options.data,
        }
        return pickingOrders[index]
      }
      throw new Error(`Order with id ${options.where.id} not found`)
    },

    count: async (options?: any) => {
      if (options?.where?.status) {
        return pickingOrders.filter((order) => order.status === options.where.status).length
      }
      return pickingOrders.length
    },
  },

  product: {
    findMany: async (options?: any) => {
      let result = [...products]

      // Filtrar si se especifica
      if (options?.where) {
        for (const key in options.where) {
          result = result.filter((product) => (product as any)[key] === options.where[key])
        }
      }

      return result
    },

    findByCode: (code: string) => {
      return products.find((product) => product.codigoRUUFE === code) || null
    },

    bulkCreate: async (productsData: any[]) => {
      // Verificar duplicados por código RUUFE
      const existingCodes = new Set(products.map((p) => p.codigoRUUFE))

      // Filtrar productos que ya existen (actualizar) y nuevos (crear)
      const toUpdate = productsData.filter((p) => existingCodes.has(p.codigoRUUFE))
      const toCreate = productsData.filter((p) => !existingCodes.has(p.codigoRUUFE))

      // Actualizar productos existentes
      toUpdate.forEach((newProduct) => {
        const index = products.findIndex((p) => p.codigoRUUFE === newProduct.codigoRUUFE)
        if (index !== -1) {
          products[index] = {
            ...products[index],
            barcode: newProduct.barcode || products[index].barcode,
            producto: newProduct.producto || products[index].producto,
            precioCOP: newProduct.precioCOP || products[index].precioCOP,
            usdCost: newProduct.usdCost || products[index].usdCost,
            rrp: newProduct.rrp || products[index].rrp,
            pesoGR: newProduct.pesoGR || products[index].pesoGR,
            marca: newProduct.marca || products[index].marca,
          }
        }
      })

      // Crear nuevos productos
      const newProducts = toCreate.map((p) => ({
        id: generateId("prod_"),
        codigoRUUFE: p.codigoRUUFE,
        barcode: p.barcode || "",
        producto: p.producto || "",
        precioCOP: p.precioCOP || 0,
        usdCost: p.usdCost || 0,
        rrp: p.rrp || 0,
        pesoGR: p.pesoGR || 0,
        marca: p.marca || "",
      }))

      products.push(...newProducts)

      return {
        count: productsData.length,
        updated: toUpdate.length,
        created: newProducts.length,
      }
    },
  },
}

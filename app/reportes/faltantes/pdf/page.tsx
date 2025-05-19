"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"

export default function PurchaseOrderPDF() {
  const searchParams = useSearchParams()
  const itemIds = searchParams.get("items")?.split(",") || []
  const [missingItems, setMissingItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [groupedItems, setGroupedItems] = useState<{ [key: string]: any[] }>({})
  const [totalValue, setTotalValue] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    async function fetchItems() {
      if (fetchedRef.current) return

      try {
        fetchedRef.current = true
        setIsLoading(true)

        // Obtener los productos faltantes seleccionados
        const response = await fetch(`/api/missing-items?ids=${itemIds.join(",")}`)
        const data = await response.json()

        if (data.success) {
          setMissingItems(data.items)
          setError(null)

          // Agrupar por marca
          const grouped = data.items.reduce((acc: { [key: string]: any[] }, item: any) => {
            const brand = item.brand || "Sin Marca"
            if (!acc[brand]) {
              acc[brand] = []
            }
            acc[brand].push(item)
            return acc
          }, {})

          setGroupedItems(grouped)

          // Calcular valor total
          const total = data.items.reduce((sum: number, item: any) => {
            return sum + (item.price || 0) * item.quantity
          }, 0)

          setTotalValue(total)
        } else {
          setError(data.error || "Error al cargar los productos")
        }
      } catch (error) {
        console.error("Error fetching missing items:", error)
        setError("Error al conectar con el servidor")
      } finally {
        setIsLoading(false)
      }
    }

    if (itemIds.length > 0) {
      fetchItems()
    } else {
      setIsLoading(false)
    }
  }, [itemIds])

  const handlePrint = () => {
    window.print()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const today = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
        <p className="mb-4">{error}</p>
        <Link href="/reportes/faltantes">
          <Button>Volver a Faltantes</Button>
        </Link>
      </div>
    )
  }

  if (itemIds.length === 0 || missingItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">No se seleccionaron productos</h1>
        <Link href="/reportes/faltantes">
          <Button>Volver a Faltantes</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Controles de impresión - solo visibles en pantalla */}
      <div className="print:hidden p-4 flex justify-between items-center">
        <Link href="/reportes/faltantes">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Imprimir Orden de Compra
        </Button>
      </div>

      {/* Documento PDF */}
      <div className="max-w-4xl mx-auto bg-white p-8 print:p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold">ORDEN DE COMPRA</h1>
            <p className="text-gray-600">Productos Faltantes en Picking</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Fecha: {today}</p>
            <p className="text-gray-600">
              OC-
              {Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, "0")}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">Resumen</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>
                <span className="font-semibold">Total Productos:</span> {missingItems.length}
              </p>
              <p>
                <span className="font-semibold">Total Unidades:</span>{" "}
                {missingItems.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
            <div className="text-right">
              <p>
                <span className="font-semibold">Valor Total:</span> {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Productos agrupados por marca */}
        {Object.entries(groupedItems).map(([brand, items]) => (
          <div key={brand} className="mb-8">
            <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-3">{brand}</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Código</th>
                  <th className="border p-2 text-left">Producto</th>
                  <th className="border p-2 text-left">Código de Barras</th>
                  <th className="border p-2 text-right">Cantidad</th>
                  <th className="border p-2 text-right">Precio Unit.</th>
                  <th className="border p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="border p-2">{item.code || "—"}</td>
                    <td className="border p-2">{item.product || "—"}</td>
                    <td className="border p-2">{item.barcode || "—"}</td>
                    <td className="border p-2 text-right">{item.quantity}</td>
                    <td className="border p-2 text-right">{item.price ? formatCurrency(item.price) : "—"}</td>
                    <td className="border p-2 text-right">
                      {item.price ? formatCurrency(item.price * item.quantity) : "—"}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td colSpan={5} className="border p-2 text-right">
                    Subtotal {brand}:
                  </td>
                  <td className="border p-2 text-right">
                    {formatCurrency(items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}

        {/* Total general */}
        <div className="mt-8 text-right">
          <p className="text-xl font-bold">Total General: {formatCurrency(totalValue)}</p>
        </div>

        {/* Firmas */}
        <div className="mt-16 grid grid-cols-2 gap-8">
          <div className="border-t pt-2">
            <p className="font-semibold">Solicitado por:</p>
            <p className="text-gray-600">Departamento de Picking</p>
          </div>
          <div className="border-t pt-2">
            <p className="font-semibold">Aprobado por:</p>
            <p className="text-gray-600">Departamento de Compras</p>
          </div>
        </div>
      </div>
    </>
  )
}

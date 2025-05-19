"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, FileText } from "lucide-react"

type MissingItem = {
  id: string
  code: string
  product: string
  brand: string
  barcode: string
  quantity: number
  price: number
  orders: Array<{
    id: string
    invoiceNumber: string
    clientName: string
  }>
}

export function MissingItemsTable() {
  const [missingItems, setMissingItems] = useState<MissingItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MissingItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [groupByBrand, setGroupByBrand] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchMissingItems() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/missing-items")
        const data = await response.json()

        if (data.success) {
          setMissingItems(data.items)
          setFilteredItems(data.items)
          setError(null)
        } else {
          setError(data.error || "Error al cargar los productos faltantes")
        }
      } catch (error) {
        console.error("Error fetching missing items:", error)
        setError("Error al conectar con el servidor")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMissingItems()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(missingItems)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = missingItems.filter(
        (item) =>
          (item.code && item.code.toLowerCase().includes(query)) ||
          (item.product && item.product.toLowerCase().includes(query)) ||
          (item.brand && item.brand.toLowerCase().includes(query)) ||
          (item.barcode && item.barcode.toLowerCase().includes(query)) ||
          item.orders.some(
            (order) =>
              order.clientName.toLowerCase().includes(query) || order.invoiceNumber.toLowerCase().includes(query),
          ),
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, missingItems])

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map((item) => item.id))
    }
  }

  const handleGeneratePurchaseOrder = () => {
    if (selectedItems.length === 0) return
    router.push(`/reportes/faltantes/pdf?items=${selectedItems.join(",")}`)
  }

  // Agrupar por orden o por marca
  const groupedItems = filteredItems.reduce((acc: Record<string, MissingItem[]>, item) => {
    const key = groupByBrand ? item.brand || "Sin Marca" : "Todos los productos"
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {})

  if (isLoading) {
    return <div className="py-8 text-center">Cargando productos faltantes...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>
  }

  if (missingItems.length === 0) {
    return <div className="py-8 text-center">No hay productos faltantes en órdenes parciales.</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 w-full max-w-md">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por código, producto, marca, código de barras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setGroupByBrand(!groupByBrand)}>
            Agrupar por {groupByBrand ? "Todos" : "Marca"}
          </Button>
          <Button
            onClick={handleGeneratePurchaseOrder}
            disabled={selectedItems.length === 0}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Generar Orden de Compra ({selectedItems.length})
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <div key={groupName} className="mb-4">
            {groupByBrand && (
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">{groupName}</h3>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={items.every((item) => selectedItems.includes(item.id))}
                      onCheckedChange={() => {
                        const allSelected = items.every((item) => selectedItems.includes(item.id))
                        if (allSelected) {
                          setSelectedItems(selectedItems.filter((id) => !items.some((item) => item.id === id)))
                        } else {
                          const newSelected = [...selectedItems]
                          items.forEach((item) => {
                            if (!newSelected.includes(item.id)) {
                              newSelected.push(item.id)
                            }
                          })
                          setSelectedItems(newSelected)
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Código de Barras</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Órdenes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.code || "—"}</TableCell>
                    <TableCell>{item.product || "—"}</TableCell>
                    <TableCell>{item.brand || "—"}</TableCell>
                    <TableCell>{item.barcode || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{item.quantity}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.orders.map((order) => (
                          <Badge key={order.id} variant="outline" className="text-xs">
                            {order.invoiceNumber}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  )
}

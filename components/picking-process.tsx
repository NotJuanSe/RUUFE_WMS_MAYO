"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Barcode, Check, CheckCircle, ChevronLeft, Search, XCircle } from "lucide-react"
import { updatePickingOrder } from "@/lib/actions"
import { cn } from "@/lib/utils"

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
  items: PickingItem[]
}

export function PickingProcess({ order }: { order: PickingOrder }) {
  const [items, setItems] = useState<PickingItem[]>(order.items)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [isPartial, setIsPartial] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Focus barcode input on mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [])

  // Calculate progress
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const pickedItems = items.reduce((acc, item) => acc + item.picked, 0)
  const progress = totalItems > 0 ? Math.round((pickedItems / totalItems) * 100) : 0
  const isComplete = pickedItems === totalItems

  // Filter items based on search query
  const filteredItems = items.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.code.toLowerCase().includes(searchLower) ||
      item.brand.toLowerCase().includes(searchLower) ||
      item.product.toLowerCase().includes(searchLower) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchLower))
    )
  })

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    const barcode = barcodeInput.trim()

    // Primero intentamos buscar por código de barras
    let itemIndex = items.findIndex(
      (item) => item.barcode && item.barcode.toLowerCase() === barcode.toLowerCase() && item.picked < item.quantity,
    )

    // Si no encontramos por código de barras, intentamos por código de producto
    if (itemIndex < 0) {
      itemIndex = items.findIndex(
        (item) => item.code.toLowerCase() === barcode.toLowerCase() && item.picked < item.quantity,
      )
    }

    if (itemIndex >= 0) {
      const updatedItems = [...items]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        picked: updatedItems[itemIndex].picked + 1,
      }
      setItems(updatedItems)

      toast({
        title: "Producto escaneado",
        description: `${updatedItems[itemIndex].product} (${updatedItems[itemIndex].picked}/${updatedItems[itemIndex].quantity})`,
        variant: "default",
      })
    } else {
      // Check if it's a valid barcode or code but already fully picked
      const fullyPickedItem = items.find(
        (item) =>
          (item.barcode && item.barcode.toLowerCase() === barcode.toLowerCase()) ||
          item.code.toLowerCase() === barcode.toLowerCase(),
      )

      if (fullyPickedItem) {
        toast({
          title: "Producto ya completado",
          description: `${fullyPickedItem.product} ya ha sido completamente recogido (${fullyPickedItem.quantity}/${fullyPickedItem.quantity})`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Código no encontrado",
          description: "Este código o código de barras no corresponde a ningún producto en esta orden.",
          variant: "destructive",
        })
      }
    }

    setBarcodeInput("")
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }

  const handleManualPick = (itemId: string) => {
    const itemIndex = items.findIndex((item) => item.id === itemId)
    if (itemIndex >= 0 && items[itemIndex].picked < items[itemIndex].quantity) {
      const updatedItems = [...items]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        picked: updatedItems[itemIndex].picked + 1,
      }
      setItems(updatedItems)
    }
  }

  const handleManualUnpick = (itemId: string) => {
    const itemIndex = items.findIndex((item) => item.id === itemId)
    if (itemIndex >= 0 && items[itemIndex].picked > 0) {
      const updatedItems = [...items]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        picked: updatedItems[itemIndex].picked - 1,
      }
      setItems(updatedItems)
    }
  }

  const handleCompleteOrder = async () => {
    setIsSaving(true)
    try {
      const status = isPartial ? "partial" : "completed"
      await updatePickingOrder(order.id, items, status)

      toast({
        title: isPartial ? "Picking parcial guardado" : "Picking completado",
        description: isPartial
          ? "La orden ha sido guardada como picking parcial. Podrás completarla más tarde."
          : "La orden ha sido marcada como completada exitosamente.",
        variant: "default",
      })

      // Redirect to appropriate page
      router.push(isPartial ? "/picking/parciales" : "/picking/completadas")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Ocurrió un error al guardar el estado del picking.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSaving(false)
      setShowCompleteDialog(false)
    }
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/picking/pendientes">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="ml-2">
              <h1 className="text-lg font-semibold">Orden de {order.clientName}</h1>
              <div className="text-sm text-gray-500">
                Cliente: {order.clientName} | Factura: {order.invoiceNumber}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">
              Progreso: {pickedItems}/{totalItems} ({progress}%)
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full">
              <div
                className={cn("h-full rounded-full", progress === 100 ? "bg-green-500" : "bg-blue-500")}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <Button
              onClick={() => {
                setIsPartial(false)
                setShowCompleteDialog(true)
              }}
              disabled={isSaving || pickedItems === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Completar
            </Button>
            <Button
              onClick={() => {
                setIsPartial(true)
                setShowCompleteDialog(true)
              }}
              disabled={isSaving || pickedItems === 0 || isComplete}
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-50"
            >
              Guardar Parcial
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Lista de Productos</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar por código, marca, producto o código de barras..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marca
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código de Barras
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className={item.picked === item.quantity ? "bg-green-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.brand}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.barcode || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Badge
                            className={
                              item.picked === item.quantity
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : item.picked > 0
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {item.picked}/{item.quantity}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManualPick(item.id)}
                              disabled={item.picked >= item.quantity}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManualUnpick(item.id)}
                              disabled={item.picked <= 0}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Escanear Código</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Barcode className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      ref={barcodeInputRef}
                      placeholder="Escanea o ingresa el código..."
                      className="pl-8"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={!barcodeInput.trim()}>
                    Escanear
                  </Button>
                </div>
              </form>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Instrucciones:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Escanea el código de barras o ingresa el código del producto</li>
                  <li>• Puedes buscar productos por código, marca o nombre</li>
                  <li>• Usa los botones + y - para ajustar manualmente</li>
                  <li>• Marca como "Parcial" si no puedes completar todo</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPartial
                ? "¿Guardar como picking parcial?"
                : "¿Completar orden de picking de " + order.clientName + "?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPartial
                ? `Has recogido ${pickedItems} de ${totalItems} productos. La orden quedará en estado parcial y podrás completarla más tarde.`
                : isComplete
                  ? "Has recogido todos los productos. La orden será marcada como completada."
                  : `Has recogido ${pickedItems} de ${totalItems} productos. ¿Estás seguro de que deseas marcar la orden como completada?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteOrder}
              disabled={isSaving}
              className={isPartial ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Guardando...
                </>
              ) : isPartial ? (
                "Guardar como Parcial"
              ) : (
                "Completar Picking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

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
import { Barcode, Camera, Check, CheckCircle, ChevronLeft, ChevronDown, ChevronUp, Search, XCircle } from "lucide-react"
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
  const [showCameraScanner, setShowCameraScanner] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [showAllItems, setShowAllItems] = useState(true)
  const [showOnlyPending, setShowOnlyPending] = useState(false)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Focus barcode input on mount
  useEffect(() => {
    if (barcodeInputRef.current && !showCameraScanner) {
      barcodeInputRef.current.focus()
    }
  }, [showCameraScanner])

  // Calculate progress
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const pickedItems = items.reduce((acc, item) => acc + item.picked, 0)
  const progress = totalItems > 0 ? Math.round((pickedItems / totalItems) * 100) : 0
  const isComplete = pickedItems === totalItems

  // Filter items based on search query and filter settings
  const filteredItems = items.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      item.code.toLowerCase().includes(searchLower) ||
      item.brand.toLowerCase().includes(searchLower) ||
      item.product.toLowerCase().includes(searchLower) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchLower))

    if (showOnlyPending) {
      return matchesSearch && item.picked < item.quantity
    }

    return matchesSearch
  })

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    processBarcode(barcodeInput.trim())
  }

  const processBarcode = (barcode: string) => {
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

      // Scroll to the item
      const itemElement = document.getElementById(`item-${updatedItems[itemIndex].id}`)
      if (itemElement) {
        itemElement.scrollIntoView({ behavior: "smooth", block: "center" })
        // Highlight the item temporarily
        itemElement.classList.add("bg-green-100")
        setTimeout(() => {
          itemElement.classList.remove("bg-green-100")
        }, 1500)
      }

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
    if (barcodeInputRef.current && !showCameraScanner) {
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

  const toggleItemExpand = (itemId: string) => {
    if (expandedItem === itemId) {
      setExpandedItem(null)
    } else {
      setExpandedItem(itemId)
    }
  }

  // Camera scanning functionality
  const startCameraScanner = async () => {
    setShowCameraScanner(true)

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      } else {
        toast({
          title: "Cámara no disponible",
          description: "Tu dispositivo no soporta acceso a la cámara.",
          variant: "destructive",
        })
        setShowCameraScanner(false)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifica los permisos.",
        variant: "destructive",
      })
      setShowCameraScanner(false)
    }
  }

  const stopCameraScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()

      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setShowCameraScanner(false)
  }

  // This is a placeholder for barcode detection
  // In a real implementation, you would use a library like quagga.js or zxing
  const captureBarcode = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Here you would process the image to detect barcodes
        // For demonstration, we'll just show a toast
        toast({
          title: "Procesando imagen",
          description: "Buscando códigos de barras en la imagen...",
        })

        // Simulate finding a barcode after a delay
        setTimeout(() => {
          // In a real implementation, this would be the detected barcode
          const mockDetectedBarcode = items[0]?.barcode || items[0]?.code

          if (mockDetectedBarcode) {
            processBarcode(mockDetectedBarcode)
          } else {
            toast({
              title: "No se detectó código",
              description: "Intenta nuevamente o ingresa el código manualmente.",
              variant: "destructive",
            })
          }
        }, 1000)
      }
    }
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-2 py-2 sm:px-6 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center">
            <Link href="/picking/pendientes">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div className="ml-2">
              <h1 className="text-base sm:text-lg font-semibold truncate">Orden de {order.clientName}</h1>
              <div className="text-xs sm:text-sm text-gray-500 truncate">
                Cliente: {order.clientName} | Factura: {order.invoiceNumber}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="text-xs sm:text-sm font-medium whitespace-nowrap">
              {pickedItems}/{totalItems} ({progress}%)
            </div>
            <div className="w-16 sm:w-24 h-2 bg-gray-200 rounded-full">
              <div
                className={cn("h-full rounded-full", progress === 100 ? "bg-green-500" : "bg-blue-500")}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <Button
                onClick={() => {
                  setIsPartial(false)
                  setShowCompleteDialog(true)
                }}
                disabled={isSaving || pickedItems === 0}
                className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-8 px-2 sm:px-3"
              >
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Completar</span>
                <span className="sm:hidden">OK</span>
              </Button>
              <Button
                onClick={() => {
                  setIsPartial(true)
                  setShowCompleteDialog(true)
                }}
                disabled={isSaving || pickedItems === 0 || isComplete}
                variant="outline"
                className="border-amber-500 text-amber-700 hover:bg-amber-50 text-xs sm:text-sm h-8 px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Guardar Parcial</span>
                <span className="sm:hidden">Parcial</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Scanner section - Moved to top on mobile */}
        <div className="lg:order-2 lg:col-span-1">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">Escanear Código</CardTitle>
            </CardHeader>
            <CardContent>
              {showCameraScanner ? (
                <div className="space-y-3">
                  <div className="relative bg-black rounded-md overflow-hidden aspect-video">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={captureBarcode} className="flex-1">
                      Capturar Código
                    </Button>
                    <Button variant="outline" onClick={stopCameraScanner} className="flex-1">
                      Cerrar Cámara
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBarcodeSubmit} className="space-y-3">
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
                    <Button type="submit" disabled={!barcodeInput.trim()} className="shrink-0">
                      <span className="hidden sm:inline">Escanear</span>
                      <Check className="h-4 w-4 sm:hidden" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={startCameraScanner}
                  >
                    <Camera className="h-4 w-4" />
                    Usar Cámara
                  </Button>
                </form>
              )}

              <div className="mt-4 sm:mt-6">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Instrucciones:</h3>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <li>• Escanea el código de barras o ingresa el código</li>
                  <li>• Usa la cámara para escanear códigos de barras</li>
                  <li>• Busca productos por código, marca o nombre</li>
                  <li>• Usa los botones + y - para ajustar manualmente</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products list */}
        <div className="lg:order-1 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">Lista de Productos</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por código, marca, producto..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={showAllItems ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setShowAllItems(true)
                      setShowOnlyPending(false)
                    }}
                    className="text-xs h-9 flex-1 sm:flex-none"
                  >
                    Todos
                  </Button>
                  <Button
                    variant={showOnlyPending ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setShowAllItems(false)
                      setShowOnlyPending(true)
                    }}
                    className="text-xs h-9 flex-1 sm:flex-none"
                  >
                    Pendientes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t border-gray-200">
                {/* Desktop view - Table */}
                <div className="hidden md:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marca
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código de Barras
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          id={`item-${item.id}`}
                          className={item.picked === item.quantity ? "bg-green-50" : ""}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.product}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.brand}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.barcode || "N/A"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
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
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
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

                {/* Mobile view - Cards */}
                <div className="block md:hidden">
                  <ul className="divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <li
                        key={item.id}
                        id={`item-${item.id}`}
                        className={cn("p-3 transition-colors", item.picked === item.quantity ? "bg-green-50" : "")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.code}</p>
                              <Badge
                                className={cn(
                                  "ml-2",
                                  item.picked === item.quantity
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : item.picked > 0
                                      ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-100",
                                )}
                              >
                                {item.picked}/{item.quantity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{item.product}</p>
                            <p className="text-xs text-gray-500 truncate">{item.brand}</p>
                          </div>
                          <button
                            className="ml-2 text-gray-400 focus:outline-none"
                            onClick={() => toggleItemExpand(item.id)}
                          >
                            {expandedItem === item.id ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </div>

                        {expandedItem === item.id && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            {item.barcode && (
                              <p className="text-xs text-gray-500 mb-2">
                                <span className="font-medium">Código de barras:</span> {item.barcode}
                              </p>
                            )}
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManualPick(item.id)}
                                disabled={item.picked >= item.quantity}
                                className="flex-1 h-8"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                <span>Añadir</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManualUnpick(item.id)}
                                disabled={item.picked <= 0}
                                className="flex-1 h-8"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                <span>Quitar</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  {filteredItems.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      No se encontraron productos que coincidan con la búsqueda.
                    </div>
                  )}
                </div>
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

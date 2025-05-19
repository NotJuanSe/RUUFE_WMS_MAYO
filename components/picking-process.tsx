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
import {
  Barcode,
  Camera,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Search,
  XCircle,
  AlertTriangle,
  Info,
  Save,
} from "lucide-react"
import { updatePickingOrder } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { BarcodeScanner } from "@/components/barcode-scanner"

// Función para hacer vibrar el dispositivo con diferentes patrones según el tipo de alerta
const vibrateDevice = (type: "success" | "error" | "warning" | "info") => {
  // Verificar si el navegador soporta la API de vibración
  if (!navigator.vibrate) {
    console.log("Este dispositivo no soporta la API de vibración")
    return
  }

  // Diferentes patrones de vibración según el tipo de alerta
  switch (type) {
    case "error":
      // Vibración fuerte para errores: 3 pulsos largos
      navigator.vibrate([200, 100, 200, 100, 200])
      break
    case "warning":
      // Vibración media para advertencias: 2 pulsos medianos
      navigator.vibrate([150, 100, 150])
      break
    case "success":
      // Vibración suave para éxitos: 1 pulso corto
      navigator.vibrate(50)
      break
    case "info":
      // Vibración muy suave para información: 1 pulso muy corto
      navigator.vibrate(25)
      break
    default:
      // Vibración genérica
      navigator.vibrate(100)
  }
}

// Custom Alert Component
function CustomAlert({
  message,
  type = "info",
  isVisible,
  onClose,
}: {
  message: string
  type?: "success" | "error" | "warning" | "info"
  isVisible: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (isVisible) {
      // Hacer vibrar el dispositivo cuando aparece una alerta
      if (type === "error" || type === "warning") {
        vibrateDevice(type)
      }

      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, type])

  if (!isVisible) return null

  const bgColor = {
    success: "bg-green-100 border-green-500 text-green-800",
    error: "bg-red-100 border-red-500 text-red-800",
    warning: "bg-amber-100 border-amber-500 text-amber-800",
    info: "bg-blue-100 border-blue-500 text-blue-800",
  }

  const Icon = {
    success: Check,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }[type]

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-3 rounded-md shadow-lg border ${
        bgColor[type]
      } max-w-sm w-full flex items-start animate-in fade-in slide-in-from-top duration-300`}
    >
      <Icon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{message}</div>
      <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700">
        <XCircle className="h-5 w-5" />
      </button>
    </div>
  )
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
  const [showInstructions, setShowInstructions] = useState(true)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Custom alert state
  const [alert, setAlert] = useState<{
    message: string
    type: "success" | "error" | "warning" | "info"
    isVisible: boolean
  }>({
    message: "",
    type: "info",
    isVisible: false,
  })

  // Function to show an alert
  const showAlert = (message: string, type: "success" | "error" | "warning" | "info") => {
    setAlert({
      message,
      type,
      isVisible: true,
    })
  }

  // Function to hide the alert
  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, isVisible: false }))
  }

  // Focus barcode input on mount and when camera is closed
  useEffect(() => {
    if (barcodeInputRef.current && !showCameraScanner) {
      barcodeInputRef.current.focus()
    }
  }, [showCameraScanner])

  // Asegurarse de que la cámara se cierre cuando el usuario navega a otra página
  useEffect(() => {
    const handleRouteChange = () => {
      if (showCameraScanner) {
        setShowCameraScanner(false)
      }
    }

    // Limpiar recursos cuando el componente se desmonta
    return () => {
      if (showCameraScanner) {
        setShowCameraScanner(false)
      }
    }
  }, [showCameraScanner])

  // Configurar event listener para la pistola de código de barras
  useEffect(() => {
    // La mayoría de las pistolas de código de barras funcionan como teclados
    // y terminan con un Enter, así que capturamos ese evento
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && barcodeInput.trim() && !showCameraScanner) {
        e.preventDefault()
        processBarcode(barcodeInput.trim())
        setBarcodeInput("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [barcodeInput, showCameraScanner])

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
    console.log("Processing barcode:", barcode)
    setLastScannedCode(barcode)

    // Verificar si el código existe en la orden actual (por código de barras o código de producto)
    const itemInOrder = items.find(
      (item) =>
        (item.barcode && item.barcode.toLowerCase() === barcode.toLowerCase()) ||
        item.code.toLowerCase() === barcode.toLowerCase(),
    )

    // If the code doesn't exist in the order
    if (!itemInOrder) {
      console.log("Product not found in order")
      showAlert("Este código no pertenece a ningún producto en esta orden de picking.", "error")
      playErrorSound()
      setBarcodeInput("")
      if (barcodeInputRef.current && !showCameraScanner) {
        barcodeInputRef.current.focus()
      }
      return
    }

    // Si el producto ya está completamente escaneado
    if (itemInOrder.picked >= itemInOrder.quantity) {
      console.log("Product already fully picked:", itemInOrder.product)
      showAlert(
        `${itemInOrder.product} ya tiene todas las unidades escaneadas (${itemInOrder.quantity}/${itemInOrder.quantity}).`,
        "warning",
      )
      playWarningSound()
      setBarcodeInput("")
      if (barcodeInputRef.current && !showCameraScanner) {
        barcodeInputRef.current.focus()
      }
      return
    }

    // Procesar el código normalmente si está en la orden y no está completo
    const itemIndex = items.findIndex((item) => item.id === itemInOrder.id)

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

      playSuccessSound()
      showAlert(
        `${updatedItems[itemIndex].product} (${updatedItems[itemIndex].picked}/${updatedItems[itemIndex].quantity})`,
        "success",
      )
    }

    setBarcodeInput("")
    if (barcodeInputRef.current && !showCameraScanner) {
      barcodeInputRef.current.focus()
    }
  }

  const playSuccessSound = () => {
    try {
      const beep = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...")
      beep.volume = 0.5
      beep.play().catch((e) => console.log("Audio play failed:", e))
    } catch (e) {
      console.log("Audio error:", e)
    }
  }

  const playErrorSound = () => {
    try {
      // Un sonido diferente para errores
      const beep = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...")
      beep.volume = 0.5
      beep.play().catch((e) => console.log("Audio play failed:", e))
    } catch (e) {
      console.log("Audio error:", e)
    }
  }

  const playWarningSound = () => {
    try {
      // Un sonido diferente para advertencias
      const beep = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...")
      beep.volume = 0.5
      beep.play().catch((e) => console.log("Audio play failed:", e))
    } catch (e) {
      console.log("Audio error:", e)
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
      showAlert(
        `${updatedItems[itemIndex].product} (${updatedItems[itemIndex].picked}/${updatedItems[itemIndex].quantity})`,
        "success",
      )
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
      showAlert(
        `Se quitó una unidad de ${updatedItems[itemIndex].product} (${updatedItems[itemIndex].picked}/${updatedItems[itemIndex].quantity})`,
        "info",
      )
    }
  }

  const handleCompleteOrder = async () => {
    setIsSaving(true)
    try {
      const status = isPartial ? "partial" : "completed"
      await updatePickingOrder(order.id, items, status)

      showAlert(
        isPartial
          ? "La orden ha sido guardada como picking parcial. Podrás completarla más tarde."
          : "La orden ha sido marcada como completada exitosamente.",
        "success",
      )

      // Asegurarse de que la cámara esté cerrada antes de navegar
      if (showCameraScanner) {
        setShowCameraScanner(false)
      }

      // Redirect to appropriate page after a short delay to show the alert
      setTimeout(() => {
        router.push(isPartial ? "/picking/parciales" : "/picking/completadas")
        router.refresh()
      }, 1500)
    } catch (error) {
      showAlert("Ocurrió un error al guardar el estado del picking.", "error")
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

  const startCameraScanner = () => {
    setShowCameraScanner(true)
  }

  const stopCameraScanner = () => {
    setShowCameraScanner(false)
    // Asegurarse de que el input reciba el foco después de cerrar la cámara
    setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus()
      }
    }, 100)
  }

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions)
  }

  const handleBarcodeDetected = (code: string) => {
    processBarcode(code)
  }

  return (
    <>
      {/* Custom Alert */}
      <CustomAlert message={alert.message} type={alert.type} isVisible={alert.isVisible} onClose={hideAlert} />

      {/* Header con información de la orden y botones de acción */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        {/* Información de la orden */}
        <div className="px-3 py-2 flex items-center">
          <Link href="/picking/pendientes">
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-semibold truncate">Orden de {order.clientName}</h1>
            <div className="text-xs text-gray-500 truncate">
              Cliente: {order.clientName} | Factura: {order.invoiceNumber}
            </div>
          </div>
        </div>

        {/* Barra de progreso y botones de acción */}
        <div className="px-3 py-2 bg-gray-50 flex flex-col">
          {/* Progreso */}
          <div className="flex items-center mb-2">
            <div className="text-xs font-medium mr-2">
              {pickedItems}/{totalItems} ({progress}%)
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div
                className={cn("h-full rounded-full", progress === 100 ? "bg-green-500" : "bg-blue-500")}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIsPartial(false)
                setShowCompleteDialog(true)
              }}
              disabled={isSaving || pickedItems === 0}
              className="bg-green-600 hover:bg-green-700 text-xs h-10 flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              <span>Completar</span>
            </Button>
            <Button
              onClick={() => {
                setIsPartial(true)
                setShowCompleteDialog(true)
              }}
              disabled={isSaving || pickedItems === 0 || isComplete}
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-50 text-xs h-10 flex-1"
            >
              <Save className="h-4 w-4 mr-1.5" />
              <span>Guardar Parcial</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Scanner section - Positioned appropriately for all screen sizes */}
        <div className="md:col-span-2 lg:col-span-1 lg:order-2">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base sm:text-lg">Escanear Código</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleInstructions}
                  className="h-8 w-8 p-0"
                  title={showInstructions ? "Ocultar instrucciones" : "Mostrar instrucciones"}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lastScannedCode && (
                <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
                  <div className="font-medium">Último código escaneado:</div>
                  <div className="text-gray-700">{lastScannedCode}</div>
                </div>
              )}

              {showCameraScanner ? (
                <BarcodeScanner onDetected={handleBarcodeDetected} onClose={stopCameraScanner} />
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
                        autoComplete="off"
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

              {/* Instrucciones colapsables */}
              {showInstructions && (
                <div className="mt-4 sm:mt-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Instrucciones:</h3>
                  </div>
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <li>• Escanea el código de barras o ingresa el código</li>
                    <li>• Usa la cámara para escanear códigos de barras</li>
                    <li>• Busca productos por código, marca o nombre</li>
                    <li>• Usa los botones + y - para ajustar manualmente</li>
                    <li>• El dispositivo vibrará al detectar errores o advertencias</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products list */}
        <div className="md:col-span-2 lg:order-1 lg:col-span-2">
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

      <style jsx global>{`
        .drawingBuffer {
          position: absolute;
          top: 0;
          left: 0;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes slide-in-from-top {
          from {
            transform: translateX(-50%) translateY(-100%);
          }
          to {
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-in.slide-in-from-top {
          animation: slide-in-from-top 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

// Añadir tipos que faltaban
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

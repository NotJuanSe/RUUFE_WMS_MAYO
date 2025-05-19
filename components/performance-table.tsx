"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, ArrowUpDown } from "lucide-react"
import { getFilteredPerformanceData } from "@/lib/actions"
import { useSearchParams } from "next/navigation"

// Definir el tipo para los datos de rendimiento
type PerformanceData = {
  id: string
  invoiceNumber: string
  clientName: string
  startTime: string
  endTime: string
  duration: number
  itemsCount: number
  pickedItems: number
  itemsPerMinute: number
}

export function PerformanceTable() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [orders, setOrders] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof PerformanceData>("endTime")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    async function loadPerformanceData() {
      try {
        setLoading(true)

        // Obtener parámetros de la URL
        const startDate = searchParams.get("startDate") || undefined
        const endDate = searchParams.get("endDate") || undefined
        const clientName = searchParams.get("client") || undefined

        const data = await getFilteredPerformanceData(startDate, endDate, clientName)
        setOrders(data)
        setError(null)
      } catch (err) {
        console.error("Error cargando datos de rendimiento:", err)
        setError("Error al cargar los datos. Por favor, intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    loadPerformanceData()
  }, [searchParams])

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Función para ordenar los datos
  const handleSort = (field: keyof PerformanceData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Ordenar y filtrar órdenes
  const sortedAndFilteredOrders = [...orders]
    .filter(
      (order) =>
        order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clientName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const valueA = a[sortField]
      const valueB = b[sortField]

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      }

      return 0
    })

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Cargando datos de rendimiento...</span>
      </div>
    )
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>{error}</p>
        <Button variant="outline" className="ml-4" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  // Calcular estadísticas generales
  const totalOrders = sortedAndFilteredOrders.length
  const totalItems = sortedAndFilteredOrders.reduce((sum, order) => sum + order.itemsCount, 0)
  const totalDuration = sortedAndFilteredOrders.reduce((sum, order) => sum + order.duration, 0)
  const averageEfficiency =
    totalOrders > 0 ? sortedAndFilteredOrders.reduce((sum, order) => sum + order.itemsPerMinute, 0) / totalOrders : 0

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por factura o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md">
            <span className="font-semibold">{totalOrders}</span> órdenes
          </div>
          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-md">
            <span className="font-semibold">{totalItems}</span> productos
          </div>
          <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-md">
            <span className="font-semibold">{totalDuration}</span> minutos
          </div>
          <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-md">
            <span className="font-semibold">{averageEfficiency.toFixed(2)}</span> prod/min
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("invoiceNumber")}>
                Factura
                {sortField === "invoiceNumber" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("clientName")}>
                Cliente
                {sortField === "clientName" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("startTime")}>
                Inicio
                {sortField === "startTime" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("endTime")}>
                Fin
                {sortField === "endTime" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("duration")}>
                Duración (min)
                {sortField === "duration" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("itemsCount")}>
                Productos
                {sortField === "itemsCount" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("itemsPerMinute")}>
                Eficiencia (prod/min)
                {sortField === "itemsPerMinute" && <ArrowUpDown className="ml-1 h-4 w-4 inline" />}
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  {orders.length === 0 ? "No hay órdenes completadas disponibles" : "No se encontraron órdenes"}
                </TableCell>
              </TableRow>
            ) : (
              sortedAndFilteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.invoiceNumber}</TableCell>
                  <TableCell>{order.clientName}</TableCell>
                  <TableCell>{formatDate(order.startTime)}</TableCell>
                  <TableCell>{formatDate(order.endTime)}</TableCell>
                  <TableCell>{order.duration}</TableCell>
                  <TableCell>
                    {order.pickedItems} / {order.itemsCount}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        order.itemsPerMinute > 0.4
                          ? "text-green-600"
                          : order.itemsPerMinute > 0.25
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {order.itemsPerMinute.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

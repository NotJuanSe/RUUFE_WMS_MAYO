"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Datos de ejemplo para la tabla
const demoData = [
  {
    id: "1",
    invoiceNumber: "F-1234",
    clientName: "Distribuidora XYZ",
    startTime: "2023-05-01T10:30:00",
    endTime: "2023-05-01T11:15:00",
    duration: 45,
    itemsCount: 15,
    pickedItems: 15,
    itemsPerMinute: 0.33,
  },
  {
    id: "2",
    invoiceNumber: "F-1235",
    clientName: "Comercial ABC",
    startTime: "2023-05-02T14:15:00",
    endTime: "2023-05-02T14:45:00",
    duration: 30,
    itemsCount: 8,
    pickedItems: 8,
    itemsPerMinute: 0.27,
  },
  {
    id: "3",
    invoiceNumber: "F-1236",
    clientName: "Tienda 123",
    startTime: "2023-05-03T09:45:00",
    endTime: "2023-05-03T10:30:00",
    duration: 45,
    itemsCount: 20,
    pickedItems: 20,
    itemsPerMinute: 0.44,
  },
  {
    id: "4",
    invoiceNumber: "F-1237",
    clientName: "Mayorista El Sol",
    startTime: "2023-05-04T11:00:00",
    endTime: "2023-05-04T11:20:00",
    duration: 20,
    itemsCount: 5,
    pickedItems: 5,
    itemsPerMinute: 0.25,
  },
  {
    id: "5",
    invoiceNumber: "F-1238",
    clientName: "Distribuidora Luna",
    startTime: "2023-05-05T15:30:00",
    endTime: "2023-05-05T16:15:00",
    duration: 45,
    itemsCount: 18,
    pickedItems: 18,
    itemsPerMinute: 0.4,
  },
]

export function PerformanceTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [orders] = useState(demoData)

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

  // Filtrar órdenes según el término de búsqueda
  const filteredOrders = orders.filter(
    (order) =>
      order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar por factura o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-80"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Factura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Duración (min)</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Eficiencia (prod/min)</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No se encontraron órdenes
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.invoiceNumber}</TableCell>
                  <TableCell>{order.clientName}</TableCell>
                  <TableCell>{formatDate(order.startTime)}</TableCell>
                  <TableCell>{formatDate(order.endTime)}</TableCell>
                  <TableCell>{order.duration}</TableCell>
                  <TableCell>
                    {order.pickedItems} / {order.itemsCount}
                  </TableCell>
                  <TableCell>{order.itemsPerMinute.toFixed(2)}</TableCell>
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

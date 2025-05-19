"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { useAutoRefresh } from "@/lib/use-auto-refresh"

interface PickingOrder {
  id: string
  invoiceNumber: string
  clientName: string
  status: string
  createdAt: string
  itemCount?: number
}

interface OptimisticPickingListProps {
  initialOrders: PickingOrder[]
  type: "pending" | "partial" | "completed"
  refreshInterval?: number
}

export function OptimisticPickingList({
  initialOrders,
  type,
  refreshInterval = 60000, // 1 minuto por defecto
}: OptimisticPickingListProps) {
  const [orders, setOrders] = useState<PickingOrder[]>(initialOrders)
  const router = useRouter()
  const { toast } = useToast()

  // Configurar actualización automática
  const { refresh, isRefreshing } = useAutoRefresh({
    interval: refreshInterval,
    enabled: true,
    onRefresh: () => {
      // Podríamos mostrar un toast o alguna indicación visual
    },
  })

  // Actualizar órdenes cuando cambian las props
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  // Función para eliminar una orden (optimista)
  const handleRemoveOrder = (id: string) => {
    // Actualización optimista de la UI
    setOrders(orders.filter((order) => order.id !== id))

    // Aquí iría la llamada a la API para eliminar realmente
    toast({
      title: "Orden eliminada",
      description: "La orden ha sido eliminada correctamente",
    })

    // Refrescar datos después de un tiempo
    setTimeout(() => {
      router.refresh()
    }, 500)
  }

  // Determinar el título y descripción según el tipo
  let title = "Órdenes de Picking"
  let description = ""

  switch (type) {
    case "pending":
      title = "Órdenes Pendientes"
      description = "Órdenes de picking que aún no han sido procesadas"
      break
    case "partial":
      title = "Órdenes Parciales"
      description = "Órdenes de picking que han sido parcialmente completadas"
      break
    case "completed":
      title = "Órdenes Completadas"
      description = "Órdenes de picking que han sido completamente procesadas"
      break
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-gray-600">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isRefreshing}>
            {isRefreshing ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay órdenes de picking{" "}
            {type === "pending" ? "pendientes" : type === "partial" ? "parciales" : "completadas"}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factura</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.invoiceNumber}</TableCell>
                    <TableCell>{order.clientName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "pending" ? "outline" : order.status === "partial" ? "secondary" : "success"
                        }
                      >
                        {order.status === "pending"
                          ? "Pendiente"
                          : order.status === "partial"
                            ? "Parcial"
                            : "Completada"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {type === "pending" && (
                          <Link href={`/picking/proceso/${order.id}`}>
                            <Button size="sm">Procesar</Button>
                          </Link>
                        )}
                        {type === "partial" && (
                          <Link href={`/picking/proceso/${order.id}`}>
                            <Button size="sm" variant="outline">
                              Continuar
                            </Button>
                          </Link>
                        )}
                        {type === "completed" && (
                          <Link href={`/reportes/picking/${order.id}`}>
                            <Button size="sm" variant="outline">
                              Ver Reporte
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          Total: {orders.length} {orders.length === 1 ? "orden" : "órdenes"}
        </div>
      </CardFooter>
    </Card>
  )
}

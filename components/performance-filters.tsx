"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, FilterIcon, Loader2, ArrowLeftIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getUniqueClients } from "@/lib/actions"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export function PerformanceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Inicializar fechas desde URL o valores por defecto
  const initialStartDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined

  const initialEndDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined

  const initialClient = searchParams.get("client") || "all"

  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate)
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate)
  const [clientName, setClientName] = useState<string>(initialClient)
  const [clients, setClients] = useState<string[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(true)

  // Cargar la lista de clientes al montar el componente
  useEffect(() => {
    async function loadClients() {
      try {
        setIsLoadingClients(true)
        const clientsList = await getUniqueClients()
        setClients(clientsList)
      } catch (error) {
        console.error("Error al cargar la lista de clientes:", error)
      } finally {
        setIsLoadingClients(false)
      }
    }

    loadClients()
  }, [])

  const applyFilters = () => {
    // Crear un nuevo objeto URLSearchParams
    const params = new URLSearchParams()

    // Añadir parámetros solo si están definidos
    if (startDate) {
      params.set("startDate", startDate.toISOString())
    }

    if (endDate) {
      params.set("endDate", endDate.toISOString())
    }

    if (clientName && clientName !== "all") {
      params.set("client", clientName)
    }

    // Actualizar la URL con los nuevos parámetros
    router.push(`/reportes/rendimiento?${params.toString()}`)
  }

  const resetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setClientName("all")
    router.push("/reportes/rendimiento")
  }

  // Estilo personalizado para ocultar los encabezados del calendario
  const calendarStyles = `
    .rdp-head_row, .rdp-head_cell {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  `

  return (
    <div className="mb-6">
      {/* Estilos inline para asegurar que se apliquen */}
      <style jsx global>
        {calendarStyles}
      </style>

      {/* Versión móvil */}
      <div className="md:hidden">
        <div className="mb-4">
          <Link href="/reportes" className="flex items-center text-blue-600 mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Volver a Reportes
          </Link>
          <h1 className="text-2xl font-bold">Análisis de Rendimiento</h1>
          <p className="text-gray-500 text-sm">Métricas de rendimiento del proceso de picking</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Fecha Inicio</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      defaultMonth={new Date()}
                      fromYear={2020}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Fecha Fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      defaultMonth={new Date()}
                      fromYear={2020}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Cliente</label>
                <Select value={clientName} onValueChange={setClientName}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    {isLoadingClients ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500 mr-2" />
                        <span className="text-sm text-gray-500">Cargando clientes...</span>
                      </div>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client} value={client}>
                          {client}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={applyFilters} className="flex-1 items-center justify-center">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>
                <Button variant="outline" onClick={resetFilters} className="flex-1">
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Versión desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Fecha Inicio</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    defaultMonth={new Date()}
                    fromYear={2020}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Fecha Fin</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    defaultMonth={new Date()}
                    fromYear={2020}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={clientName} onValueChange={setClientName}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {isLoadingClients ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500 mr-2" />
                      <span className="text-sm text-gray-500">Cargando clientes...</span>
                    </div>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={applyFilters} className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

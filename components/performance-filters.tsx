"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, FilterIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function PerformanceFilters() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [client, setClient] = useState<string>("")
  const [operator, setOperator] = useState<string>("")

  const applyFilters = () => {
    // Aquí iría la lógica para aplicar los filtros
    console.log("Aplicando filtros:", { startDate, endDate, client, operator })
  }

  const resetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setClient("")
    setOperator("")
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Fecha Inicio</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
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
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Cliente</label>
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos los clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                <SelectItem value="cliente1">Distribuidora XYZ</SelectItem>
                <SelectItem value="cliente2">Comercial ABC</SelectItem>
                <SelectItem value="cliente3">Tienda 123</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Operador</label>
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos los operadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los operadores</SelectItem>
                <SelectItem value="op1">Juan Pérez</SelectItem>
                <SelectItem value="op2">María López</SelectItem>
                <SelectItem value="op3">Carlos Rodríguez</SelectItem>
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
  )
}

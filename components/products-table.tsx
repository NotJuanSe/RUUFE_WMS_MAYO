"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = {
  id: string
  codigoRUUFE: string
  barcode: string
  producto: string
  precioCOP: number
  usdCost: number
  rrp: number
  pesoGR: number
  marca: string
}

export function ProductsTable({ products }: { products: Product[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("todas")

  // Obtener marcas únicas para el filtro
  const uniqueBrands = Array.from(new Set(products.map((p) => p.marca)))

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.codigoRUUFE.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.marca.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBrand = brandFilter === "todas" || product.marca === brandFilter

    return matchesSearch && matchesBrand
  })

  // Formatear precio
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Formatear precio USD
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por código, barcode o producto..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las marcas</SelectItem>
              {uniqueBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código RUUFE</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead className="w-[300px]">Producto</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Precio COP</TableHead>
              <TableHead>USD Cost</TableHead>
              <TableHead>RRP</TableHead>
              <TableHead>Peso (g)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No se encontraron productos con los criterios de búsqueda
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.codigoRUUFE}</TableCell>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell>{product.producto}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-100">
                      {product.marca}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(product.precioCOP)}</TableCell>
                  <TableCell>{formatUSD(product.usdCost)}</TableCell>
                  <TableCell>{formatUSD(product.rrp)}</TableCell>
                  <TableCell>{product.pesoGR} g</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">
        Mostrando {filteredProducts.length} de {products.length} productos
      </div>
    </div>
  )
}

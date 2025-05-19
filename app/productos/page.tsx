import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductsTable } from "@/components/products-table"
import { getProducts } from "@/lib/actions"

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          <p className="text-gray-600">Administra el catálogo de productos y códigos de barras</p>
        </div>
        <div className="flex gap-2">
          <Link href="/productos/cargar">
            <Button className="bg-green-600 hover:bg-green-700">Cargar Excel</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Volver al Inicio</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Productos</CardTitle>
          <CardDescription>{products.length} productos en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsTable products={products} />
        </CardContent>
      </Card>
    </main>
  )
}

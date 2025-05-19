import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProductById } from "@/lib/actions"

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

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
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Detalle de Producto</h1>
          <p className="text-gray-600">{product.producto}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/productos/${product.id}/edit`}>
            <Button>Editar Producto</Button>
          </Link>
          <Link href="/productos">
            <Button variant="outline">Volver a Productos</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Código RUUFE</div>
                <div className="text-lg">{product.codigoRUUFE}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Código de Barras</div>
                <div className="text-lg">{product.barcode || "No disponible"}</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Producto</div>
              <div className="text-lg">{product.producto}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Marca</div>
              <div className="text-lg">{product.marca}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Peso</div>
              <div className="text-lg">{product.pesoGR} gramos</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Precios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Precio COP</div>
              <div className="text-lg font-bold">{formatCurrency(product.precioCOP)}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Costo USD</div>
              <div className="text-lg">{formatUSD(product.usdCost)}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Precio de Venta Recomendado (RRP)</div>
              <div className="text-lg">{formatUSD(product.rrp)}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500">Margen</div>
              <div className="text-lg">
                {product.rrp > 0 && product.usdCost > 0
                  ? `${Math.round(((product.rrp - product.usdCost) / product.rrp) * 100)}%`
                  : "No disponible"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

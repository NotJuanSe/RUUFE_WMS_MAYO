import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProductById } from "@/lib/actions"
import { ProductEditForm } from "@/components/product-edit-form"

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Editar Producto</h1>
          <p className="text-gray-600">{product.producto}</p>
        </div>
        <Link href={`/productos/${product.id}`}>
          <Button variant="outline">Cancelar</Button>
        </Link>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductEditForm product={product} />
        </CardContent>
      </Card>
    </main>
  )
}

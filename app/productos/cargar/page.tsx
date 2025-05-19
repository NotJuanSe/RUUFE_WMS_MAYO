import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExcelUploader } from "@/components/excel-uploader"

export default function UploadProductsPage() {
  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cargar Productos desde Excel</h1>
          <p className="text-gray-600">Sube un archivo Excel con los productos organizados por marcas</p>
        </div>
        <Link href="/productos">
          <Button variant="outline">Volver a Productos</Button>
        </Link>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Carga de Archivo Excel</CardTitle>
          <CardDescription>
            Cada hoja del Excel debe corresponder a una marca y contener las columnas: Codigo RUUFE, BARCODE, PRODUCTOS,
            Precio COP, USD Cost, RRP, Peso GR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExcelUploader />
        </CardContent>
      </Card>
    </main>
  )
}

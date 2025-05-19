import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { MissingItemsTable } from "@/components/missing-items-table"
import { MissingItemsStats } from "@/components/missing-items-stats"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function FaltantesPage() {
  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/reportes" className="flex items-center text-blue-600 hover:text-blue-800 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Reportes
          </Link>
          <h1 className="text-2xl font-bold">Reporte de Faltantes</h1>
          <p className="text-gray-600">Gestiona los productos faltantes en pickings parciales</p>
        </div>
      </div>

      <MissingItemsStats />

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Productos Faltantes</CardTitle>
          <CardDescription>Lista consolidada de productos faltantes en todas las órdenes parciales</CardDescription>
        </CardHeader>
        <CardContent>
          <MissingItemsTable />
        </CardContent>
      </Card>
    </main>
  )
}

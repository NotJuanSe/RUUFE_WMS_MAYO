import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { DashboardStats } from "@/components/dashboard-stats"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col p-6 md:p-12">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Sistema de Picking RUUFE</h1>
        <p className="text-gray-600 text-center max-w-2xl">
          Gestiona tus órdenes de picking, escanea productos y genera reportes de manera eficiente.
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Cargar Cuenta de Cobro</CardTitle>
            <CardDescription>
              Sube un archivo HTML de cuenta de cobro para generar una nueva orden de picking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">Formatos soportados: HTML</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Picking</CardTitle>
            <CardDescription>Accede a las órdenes de picking pendientes y completadas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/picking/pendientes" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Órdenes Pendientes</Button>
            </Link>
            <Link href="/picking/parciales" className="w-full">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">Órdenes Parciales</Button>
            </Link>
            <Link href="/picking/completadas" className="w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700">Órdenes Completadas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <CardDescription>Gestiona el catálogo de productos y códigos de barras</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/productos">
              <Button className="w-full">Ver Productos</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reportes</CardTitle>
            <CardDescription>Genera reportes de picking y actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reportes">
              <Button className="w-full">Ver Reportes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Configura el sistema y los parámetros</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/configuracion">
              <Button className="w-full">Configuración</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { uploadProducts } from "@/lib/actions"
import { FileSpreadsheet, Upload, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type ProductData = {
  codigoRUUFE: string
  barcode: string
  producto: string
  precioCOP: number
  usdCost: number
  rrp: number
  pesoGR: number
  marca: string
}

export function ExcelUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sheetData, setSheetData] = useState<{ [key: string]: ProductData[] }>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setSuccess(null)
    setSheetData({})

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls")) {
        setFile(selectedFile)
      } else {
        setError("Por favor, sube un archivo Excel (.xlsx o .xls)")
      }
    }
  }

  const processExcel = async () => {
    if (!file) return

    setLoading(true)
    setProgress(10)
    setError(null)
    setSuccess(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)

      setProgress(30)

      // Verificar que hay hojas en el Excel
      if (workbook.SheetNames.length === 0) {
        throw new Error("El archivo Excel no contiene hojas")
      }

      const processedData: { [key: string]: ProductData[] } = {}

      // Procesar cada hoja (cada una es una marca)
      for (let i = 0; i < workbook.SheetNames.length; i++) {
        const sheetName = workbook.SheetNames[i]
        const worksheet = workbook.Sheets[sheetName]

        // Convertir la hoja a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) continue

        // Validar que la hoja tiene las columnas requeridas
        const firstRow = jsonData[0] as any
        const requiredColumns = ["Codigo RUUFE", "BARCODE", "PRODUCTOS", "Precio COP", "USD Cost", "RRP", "Peso GR"]

        const missingColumns = requiredColumns.filter((col) => !(col in firstRow))
        if (missingColumns.length > 0) {
          throw new Error(`La hoja "${sheetName}" no contiene las columnas: ${missingColumns.join(", ")}`)
        }

        // Mapear los datos a nuestro formato
        const products: ProductData[] = jsonData.map((row: any) => ({
          codigoRUUFE: row["Codigo RUUFE"]?.toString() || "",
          barcode: row["BARCODE"]?.toString() || "",
          producto: row["PRODUCTOS"]?.toString() || "",
          precioCOP: Number.parseFloat(row["Precio COP"]) || 0,
          usdCost: Number.parseFloat(row["USD Cost"]) || 0,
          rrp: Number.parseFloat(row["RRP"]) || 0,
          pesoGR: Number.parseFloat(row["Peso GR"]) || 0,
          marca: sheetName,
        }))

        processedData[sheetName] = products

        // Actualizar progreso
        setProgress(30 + Math.floor(((i + 1) / workbook.SheetNames.length) * 40))
      }

      setSheetData(processedData)
      setProgress(70)

      // Contar productos totales
      const totalProducts = Object.values(processedData).reduce((sum, products) => sum + products.length, 0)

      if (totalProducts === 0) {
        throw new Error("No se encontraron productos en el archivo Excel")
      }

      // Subir los datos a la base de datos
      const result = await uploadProducts(processedData)

      setProgress(100)

      if (result.success) {
        setSuccess(
          `Se han cargado ${totalProducts} productos de ${Object.keys(processedData).length} marcas correctamente.`,
        )
        toast({
          title: "Carga exitosa",
          description: `Se han cargado ${totalProducts} productos correctamente.`,
        })

        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push("/productos")
          router.refresh()
        }, 2000)
      } else {
        throw new Error(result.error || "Error al cargar los productos")
      }
    } catch (err: any) {
      setError(err.message || "Error al procesar el archivo Excel")
      toast({
        title: "Error",
        description: err.message || "Error al procesar el archivo Excel",
        variant: "destructive",
      })
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="cursor-pointer"
            disabled={loading}
          />
        </div>

        {file && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileSpreadsheet size={16} />
            <span className="truncate">{file.name}</span>
          </div>
        )}

        <Button onClick={processExcel} disabled={!file || loading} className="w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Procesando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload size={16} />
              Cargar y Procesar
            </span>
          )}
        </Button>
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Procesando archivo...</div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Carga exitosa</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {Object.keys(sheetData).length > 0 && !error && !success && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Resumen de datos encontrados:</h3>
          <div className="space-y-2">
            {Object.entries(sheetData).map(([marca, productos]) => (
              <div key={marca} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="font-medium">{marca}</span>
                <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                  {productos.length} productos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

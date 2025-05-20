"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Upload, FileText, RefreshCw, CheckCircle, X } from "lucide-react"
import { createPickingOrder } from "@/lib/actions"
import { useRouter } from "next/navigation"

export function FileUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [results, setResults] = useState<{ orderId: string; itemCount: number }[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (success && countdown === 0) {
      // Refrescar la página
      router.refresh()

      // Navegar a la página de órdenes pendientes
      setTimeout(() => {
        router.push("/picking/pendientes")
        setSuccess(false)
      }, 500)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [success, countdown, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      const validFiles: File[] = []
      const invalidFiles: string[] = []

      selectedFiles.forEach((file) => {
        if (file.name.endsWith(".html")) {
          validFiles.push(file)
        } else {
          invalidFiles.push(file.name)
        }
      })

      if (invalidFiles.length > 0) {
        toast({
          title: "Algunos archivos no son soportados",
          description: `Los siguientes archivos no son HTML: ${invalidFiles.join(", ")}`,
          variant: "destructive",
        })
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles])
      }
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No hay archivos seleccionados",
        description: "Por favor, selecciona al menos un archivo HTML de cuenta de cobro.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const uploadResults: { orderId: string; itemCount: number }[] = []
    let hasErrors = false

    try {
      // Process each file sequentially
      for (const file of files) {
        try {
          const fileContent = await file.text()
          const result = await createPickingOrder(fileContent)

          if (result.success && result.orderId && result.itemCount !== undefined) {
            uploadResults.push({
              orderId: result.orderId,
              itemCount: result.itemCount,
            })
          } else {
            toast({
              title: `Error al procesar "${file.name}"`,
              description:
                result.error || "No se pudo procesar el archivo. Verifica que sea una cuenta de cobro válida.",
              variant: "destructive",
            })
            hasErrors = true
          }
        } catch (error) {
          toast({
            title: `Error al procesar "${file.name}"`,
            description: "Ocurrió un error al procesar el archivo.",
            variant: "destructive",
          })
          hasErrors = true
        }
      }

      if (uploadResults.length > 0) {
        setResults(uploadResults)

        const totalOrders = uploadResults.length
        const totalItems = uploadResults.reduce((sum, result) => sum + result.itemCount, 0)

        toast({
          title: `${totalOrders} ${totalOrders === 1 ? "orden creada" : "órdenes creadas"}`,
          description: `Se ${totalOrders === 1 ? "ha" : "han"} creado ${totalOrders} ${totalOrders === 1 ? "orden" : "órdenes"} con un total de ${totalItems} productos.`,
          variant: "default",
        })

        setFiles([])
        setSuccess(true)
        setCountdown(3)
      }
    } catch (error) {
      toast({
        title: "Error al procesar los archivos",
        description: "Ocurrió un error al procesar los archivos. Inténtalo de nuevo.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Input
          id="invoice-file"
          type="file"
          accept=".html"
          multiple
          onChange={handleFileChange}
          className="cursor-pointer"
          disabled={loading || success}
        />
      </div>

      {files.length > 0 && !success && (
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-sm font-medium text-gray-700">
            {files.length} {files.length === 1 ? "archivo seleccionado" : "archivos seleccionados"}:
          </p>
          <div className="max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 text-sm text-gray-600 p-2 bg-gray-50 rounded-md mb-1"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText size={16} />
                  <span className="truncate">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  disabled={loading}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {success ? (
        <div className="w-full bg-green-50 border border-green-200 rounded-md p-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span className="font-medium">
              {results.length === 1 ? "Orden creada exitosamente" : `${results.length} órdenes creadas exitosamente`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw size={16} className={countdown > 0 ? "animate-spin" : ""} />
            <span>{countdown > 0 ? `Redirigiendo a órdenes pendientes en ${countdown}...` : "Redirigiendo..."}</span>
          </div>
        </div>
      ) : (
        <Button onClick={handleUpload} disabled={files.length === 0 || loading} className="w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Procesando {files.length > 1 ? `${files.length} archivos` : "archivo"}...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload size={16} />
              {files.length > 0
                ? `Cargar y Procesar ${files.length} ${files.length === 1 ? "archivo" : "archivos"}`
                : "Cargar y Procesar"}
            </span>
          )}
        </Button>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Upload, FileText, RefreshCw, CheckCircle } from "lucide-react"
import { createPickingOrder } from "@/lib/actions"
import { useRouter } from "next/navigation"

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)
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
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.name.endsWith(".html")) {
        setFile(selectedFile)
      } else {
        toast({
          title: "Formato no soportado",
          description: "Por favor, sube un archivo HTML de cuenta de cobro.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No hay archivo seleccionado",
        description: "Por favor, selecciona un archivo HTML de cuenta de cobro.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const fileContent = await file.text()
      const result = await createPickingOrder(fileContent)

      if (result.success) {
        toast({
          title: "Orden de picking creada",
          description: `Se ha creado la orden de picking #${result.orderId} con ${result.itemCount} productos.`,
          variant: "default",
        })
        setFile(null)

        // Iniciar cuenta regresiva para refrescar
        setSuccess(true)
        setCountdown(3)
      } else {
        toast({
          title: "Error al procesar el archivo",
          description: result.error || "No se pudo procesar el archivo. Verifica que sea una cuenta de cobro válida.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error al procesar el archivo",
        description: "Ocurrió un error al procesar el archivo. Inténtalo de nuevo.",
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
          onChange={handleFileChange}
          className="cursor-pointer"
          disabled={loading || success}
        />
      </div>

      {file && !success && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText size={16} />
          <span className="truncate">{file.name}</span>
        </div>
      )}

      {success ? (
        <div className="w-full bg-green-50 border border-green-200 rounded-md p-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span className="font-medium">Orden creada exitosamente</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw size={16} className={countdown > 0 ? "animate-spin" : ""} />
            <span>{countdown > 0 ? `Redirigiendo a órdenes pendientes en ${countdown}...` : "Redirigiendo..."}</span>
          </div>
        </div>
      ) : (
        <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
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
      )}
    </div>
  )
}

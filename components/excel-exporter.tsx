"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExcelExporterProps {
  data: any
  fileName: string
  title: string
}

export function ExcelExporter({ data, fileName, title }: ExcelExporterProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      // Aquí iría la lógica para exportar a Excel
      // Por ahora, solo simulamos una descarga
      setTimeout(() => {
        alert(`Excel "${fileName}" exportado exitosamente`)
        setIsExporting(false)
      }, 1500)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={exportToExcel} disabled={isExporting} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      {isExporting ? "Exportando..." : title}
    </Button>
  )
}

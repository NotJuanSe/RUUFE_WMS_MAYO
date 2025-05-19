"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

interface PdfGeneratorProps {
  data: any
  fileName: string
  title: string
}

export function PdfGenerator({ data, fileName, title }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      // Aquí iría la lógica para generar el PDF
      // Por ahora, solo simulamos una descarga
      setTimeout(() => {
        alert(`PDF "${fileName}" generado exitosamente`)
        setIsGenerating(false)
      }, 1500)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={generatePDF} disabled={isGenerating} className="flex items-center gap-2" variant="outline">
      <FileText className="h-4 w-4" />
      {isGenerating ? "Generando..." : title}
    </Button>
  )
}

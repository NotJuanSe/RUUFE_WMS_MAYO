import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reportes | Sistema de Picking",
  description: "Reportes y análisis del sistema de picking",
}

export default function ReportesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/components/sidebar-provider"
import { SidebarLayout } from "@/components/sidebar-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Picking RUUFE",
  description: "Sistema de gestión de picking para RUUFE",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SidebarProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  )
}

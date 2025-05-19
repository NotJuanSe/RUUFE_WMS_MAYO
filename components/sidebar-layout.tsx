"use client"

import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-provider"

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const { isOpen, toggle } = useSidebar()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // No renderizar nada hasta que el componente esté montado en el cliente
  if (!isMounted) {
    return <div className="flex min-h-screen flex-col">{children}</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header con botón de menú */}
      <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-white px-4 md:px-6">
        <button
          onClick={toggle}
          className="mr-4 rounded-md p-1.5 hover:bg-gray-100"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <Menu size={22} />
        </button>
        <div className="flex-1 text-lg font-semibold">Sistema de Picking RUUFE</div>
      </header>

      <div className="relative flex flex-1 flex-col md:flex-row">
        <SidebarNav />
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-gray-50 p-4 transition-all duration-300",
            isOpen ? "md:ml-64" : "ml-0",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

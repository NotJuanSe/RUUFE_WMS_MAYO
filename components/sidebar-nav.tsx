"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ClipboardList, Home, Package, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useSidebar } from "./sidebar-provider"
import Image from "next/image"

export function SidebarNav() {
  const pathname = usePathname()
  const { isOpen, toggle, close } = useSidebar()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // No renderizar nada hasta que el componente esté montado en el cliente
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Overlay para cerrar el sidebar en dispositivos móviles */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={close} aria-hidden="true" />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-white transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Logo RUUFE"
                width={120}
                height={40}
                className="h-auto w-75"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  e.currentTarget.src = "/placeholder.svg?height=40&width=120"
                }}
              />
            </div>
            <button onClick={close} className="rounded-md p-1 hover:bg-gray-100" aria-label="Cerrar menú">
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className={cn(
                  "flex items-center rounded-md px-3 py-2 hover:bg-gray-100",
                  pathname === "/" ? "bg-gray-100 font-medium" : "",
                )}
                onClick={() => close()}
              >
                <Home className="h-5 w-5 text-gray-500" />
                <span className="ml-3">Inicio</span>
              </Link>
            </li>
            <li>
              <Accordion type="single" collapsible>
                <AccordionItem value="picking" className="border-none">
                  <AccordionTrigger className="flex items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:no-underline">
                    <div className="flex items-center">
                      <ClipboardList className="h-5 w-5 text-gray-500" />
                      <span className="ml-3">Picking</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <ul className="space-y-1 pl-8">
                      <li>
                        <Link
                          href="/picking/pendientes"
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 hover:bg-gray-100",
                            pathname === "/picking/pendientes" ? "bg-gray-100 font-medium" : "",
                          )}
                          onClick={() => close()}
                        >
                          Pendientes
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/picking/parciales"
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 hover:bg-gray-100",
                            pathname === "/picking/parciales" ? "bg-gray-100 font-medium" : "",
                          )}
                          onClick={() => close()}
                        >
                          Parciales
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/picking/completadas"
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 hover:bg-gray-100",
                            pathname === "/picking/completadas" ? "bg-gray-100 font-medium" : "",
                          )}
                          onClick={() => close()}
                        >
                          Completadas
                        </Link>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </li>
            <li>
              <Link
                href="/productos"
                className={cn(
                  "flex items-center rounded-md px-3 py-2 hover:bg-gray-100",
                  pathname === "/productos" || pathname.startsWith("/productos/") ? "bg-gray-100 font-medium" : "",
                )}
                onClick={() => close()}
              >
                <Package className="h-5 w-5 text-gray-500" />
                <span className="ml-3">Productos</span>
              </Link>
            </li>
            <li>
              <Accordion type="single" collapsible>
                <AccordionItem value="reportes" className="border-none">
                  <AccordionTrigger className="flex items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:no-underline">
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-gray-500" />
                      <span className="ml-3">Reportes</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <ul className="space-y-1 pl-8">
                      <li>
                        <Link
                          href="/reportes/rendimiento"
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 hover:bg-gray-100",
                            pathname === "/reportes/rendimiento" ? "bg-gray-100 font-medium" : "",
                          )}
                          onClick={() => close()}
                        >
                          Rendimiento
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/reportes/faltantes"
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 hover:bg-gray-100",
                            pathname === "/reportes/faltantes" ? "bg-gray-100 font-medium" : "",
                          )}
                          onClick={() => close()}
                        >
                          Faltantes
                        </Link>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </li>
            <li>
              <Link
                href="/configuracion"
                className={cn(
                  "flex items-center rounded-md px-3 py-2 hover:bg-gray-100",
                  pathname === "/configuracion" ? "bg-gray-100 font-medium" : "",
                )}
                onClick={() => close()}
              >
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="ml-3">Configuración</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="border-t p-4">
          <div className="text-xs text-gray-500">Sistema de Picking RUUFE v1.0</div>
        </div>
      </aside>
    </>
  )
}

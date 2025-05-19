"use client"

import { useState, useTransition } from "react"

/**
 * Hook para manejar actualizaciones optimistas de la UI
 * @param initialData Datos iniciales
 * @returns [data, updateData, isPending]
 */
export function useOptimisticUpdate<T>(initialData: T): [T, (newData: T) => void, boolean] {
  const [data, setData] = useState<T>(initialData)
  const [isPending, startTransition] = useTransition()

  const updateData = (newData: T) => {
    // Actualización inmediata para UI (optimista)
    setData(newData)

    // Transición para operaciones que podrían tardar
    startTransition(() => {
      // Aquí se puede añadir lógica adicional si es necesario
    })
  }

  return [data, updateData, isPending]
}

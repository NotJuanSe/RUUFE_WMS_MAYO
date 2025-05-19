"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { updateProduct, deleteProduct } from "@/lib/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Esquema de validación
const productSchema = z.object({
  codigoRUUFE: z.string().min(1, "El código RUUFE es obligatorio"),
  barcode: z.string().optional(),
  producto: z.string().min(1, "El nombre del producto es obligatorio"),
  precioCOP: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  usdCost: z.coerce.number().min(0, "El costo USD debe ser mayor o igual a 0"),
  rrp: z.coerce.number().min(0, "El RRP debe ser mayor o igual a 0"),
  pesoGR: z.coerce.number().min(0, "El peso debe ser mayor o igual a 0"),
  marca: z.string().min(1, "La marca es obligatoria"),
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductEditForm({ product }: { product: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Inicializar el formulario con los valores del producto
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      codigoRUUFE: product.codigoRUUFE,
      barcode: product.barcode || "",
      producto: product.producto,
      precioCOP: product.precioCOP,
      usdCost: product.usdCost,
      rrp: product.rrp,
      pesoGR: product.pesoGR,
      marca: product.marca,
    },
  })

  // Manejar el envío del formulario
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await updateProduct(product.id, data)

      if (result.success) {
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente",
        })
        router.push(`/productos/${product.id}`)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al actualizar el producto",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar la eliminación del producto
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteProduct(product.id)

      if (result.success) {
        toast({
          title: "Producto eliminado",
          description: "El producto se ha eliminado correctamente",
        })
        router.push("/productos")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al eliminar el producto",
          variant: "destructive",
        })
        setShowDeleteDialog(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el producto",
        variant: "destructive",
      })
      setShowDeleteDialog(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="codigoRUUFE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código RUUFE</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Barras</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="producto"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pesoGR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (gramos)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="precioCOP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio COP</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usdCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo USD</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rrp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Venta Recomendado (RRP)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  Eliminar Producto
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el producto de la base de datos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground"
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

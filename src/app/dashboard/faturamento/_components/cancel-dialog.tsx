'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Loader2 } from "lucide-react"

export function CancelSubscriptionDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setLoading(true)
    try {
      const res = await fetch("/api/store/subscription", { method: "DELETE" })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Erro ao cancelar assinatura")
        return
      }

      setOpen(false)
      router.refresh()
    } catch (e: any) {
      alert(e.message || "Erro ao cancelar assinatura")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <AlertTriangle className="mr-1 h-4 w-4" />
          Cancelar Assinatura
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Assinatura</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar sua assinatura? Você perderá acesso
            aos benefícios ao final do período atual.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              "Confirmar Cancelamento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

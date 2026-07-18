"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h2 className="text-2xl font-heading font-semibold text-on-surface mb-2">
        Algo deu errado
      </h2>
      <p className="text-on-surface-variant text-sm max-w-md mb-8">
        {error.digest
          ? "Um erro inesperado ocorreu. Tente novamente."
          : error.message || "Um erro inesperado ocorreu."}
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="default" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
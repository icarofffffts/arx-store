import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-[#5865F2]">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Pagina nao encontrada</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        A pagina que voce procura nao existe ou foi removida.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Voltar ao inicio</Link>
      </Button>
    </div>
  )
}

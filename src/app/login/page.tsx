import { getArxLoginUrl } from "@/lib/arx-urls"
import { LoginButtons } from "./login-buttons"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const arxLoginUrl = getArxLoginUrl("/servidores")

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#030014] relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c3aed]/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#5865F2]/10 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#7c3aed] flex items-center justify-center mb-5 shadow-lg shadow-[#5865F2]/20">
            <ShoppingBag className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Entrar no ARX Store</h1>
          <p className="mt-2 text-sm text-muted-foreground">Escolha como deseja acessar sua conta</p>
        </div>

        <div className="glass-card p-8 border-[#5865F2]/10">
          <LoginButtons arxLoginUrl={arxLoginUrl} />

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-center text-xs text-muted-foreground">
              Ao entrar, você concorda com nossos{" "}
              <Link href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            &larr; Voltar para o início
          </Link>
        </p>
      </div>
    </div>
  )
}

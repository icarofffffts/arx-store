import { getArxLoginUrl } from "@/lib/arx-urls"
import { LoginButtons } from "./login-buttons"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const arxLoginUrl = getArxLoginUrl("/servidores")

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
      <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-red-500/5 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md animate-reveal">
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Entrar no ARX Store</h1>
          <p className="text-slate-400 text-sm">Escolha como deseja acessar sua conta</p>
        </div>

        <div className="glass p-8 border-red-500/10">
          <LoginButtons arxLoginUrl={arxLoginUrl} />
          <div className="mt-6 pt-6 border-t border-white/[0.05]">
            <p className="text-center text-xs text-slate-500">
              Ao entrar, voce concorda com nossos{" "}
              <Link href="#" className="underline underline-offset-2 hover:text-white transition-colors">
                Termos de Uso
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Voltar para o inicio
          </Link>
        </p>
      </div>
    </div>
  )
}

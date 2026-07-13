import { getArxLoginUrl } from "@/lib/arx-auth"
import { LoginButtons } from "./login-buttons"
import { ShoppingBag, AlertCircle } from "lucide-react"
import Link from "next/link"

type SearchParams = Promise<{ error?: string }>

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Erro ao iniciar login com Discord. Verifique a configuracao.",
  OAuthCallback: "Redirect URI invalido ou nao configurado no Discord Developer Portal.",
  OAuthCreateAccount: "Erro ao criar conta. Tente novamente.",
  EmailCreateAccount: "Erro ao criar conta. Tente novamente.",
  Callback: "Erro no callback de autenticacao. Verifique o NEXTAUTH_URL.",
  OAuthAccountNotLinked: "Esta conta Discord ja esta vinculada a outro usuario.",
  EmailSignin: "Erro ao enviar e-mail de login.",
  CredentialsSignin: "Credenciais invalidas.",
  SessionRequired: "Voce precisa estar logado para acessar esta pagina.",
  default: "Erro ao autenticar. Tente novamente.",
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const error = params.error
  const errorMsg = error ? ERROR_MESSAGES[error] || error : null
  const arxLoginUrl = getArxLoginUrl("/dashboard")

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
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-400">Falha na autenticacao</p>
                <p className="text-xs text-amber-400/70">{errorMsg}</p>
              </div>
            </div>
          )}
          <LoginButtons arxLoginUrl={arxLoginUrl} />
          <div className="mt-6 pt-6 border-t border-white/[0.05]">
            <p className="text-center text-xs text-slate-500">
              Ao entrar, voce concorda com nossos{" "}
              <Link href="/termos" className="underline underline-offset-2 hover:text-white transition-colors">
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

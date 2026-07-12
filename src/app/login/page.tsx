import { getArxLoginUrl } from "@/lib/arx-urls"
import { LoginButtons } from "./login-buttons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const arxLoginUrl = getArxLoginUrl("/servidores")

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background via-[#1a0a2e]/10 to-background">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-[#5865F2]/10 flex items-center justify-center mb-2">
            <svg
              className="h-6 w-6 text-[#5865F2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Entrar no ARX Store</CardTitle>
          <CardDescription className="text-base">
            Escolha como deseja acessar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginButtons arxLoginUrl={arxLoginUrl} />
        </CardContent>
        <CardFooter className="flex-col">
          <p className="text-xs text-muted-foreground text-center">
            Ao entrar, você concorda com nossos{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Termos de Uso
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

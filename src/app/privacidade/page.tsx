import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 max-w-3xl py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao inicio
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-8">
          Politica de Privacidade
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-slate-400">
          <p className="text-base leading-relaxed">
            Ultima atualizacao: {new Date().toLocaleDateString("pt-BR")}
          </p>

          <h2 className="text-xl font-bold text-white mt-8">1. Dados Coletados</h2>
          <p>
            Coletamos apenas os dados necessarios para o funcionamento do servico:
            ID do Discord, nome de usuario, avatar, email (quando fornecido via ARX Auth)
            e informacoes dos servidores onde nossos bots estao ativos.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">2. Uso dos Dados</h2>
          <p>
            Seus dados sao usados exclusivamente para autenticacao, gerenciamento de
            assinaturas e funcionamento dos bots. Nao compartilhamos seus dados com
            terceiros, exceto quando necessario para processamento de pagamentos
            (Mercado Pago).
          </p>

          <h2 className="text-xl font-bold text-white mt-8">3. Armazenamento</h2>
          <p>
            Os dados sao armazenados em servidores seguros com criptografia em transito
            e em repouso. Utilizamos Supabase (PostgreSQL) como banco de dados principal.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">4. Seus Direitos</h2>
          <p>
            Voce pode solicitar a exclusao de seus dados a qualquer momento entrando em
            contato conosco. Ao deletar sua conta, todos os dados associados serao
            removidos permanentemente.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">5. Cookies</h2>
          <p>
            Utilizamos cookies essenciais para autenticacao (arx_token, next-auth session).
            Nao utilizamos cookies de rastreamento ou analytics de terceiros.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">6. Contato</h2>
          <p>
            Para questoes sobre privacidade, entre em contato pelo nosso servidor Discord
            ou envie um email para suporte@arxdevs.xyz.
          </p>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermosPage() {
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
          Termos de Uso
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-slate-400">
          <p className="text-base leading-relaxed">
            Ultima atualizacao: {new Date().toLocaleDateString("pt-BR")}
          </p>

          <h2 className="text-xl font-bold text-white mt-8">1. Aceitacao dos Termos</h2>
          <p>
            Ao acessar e usar o ARX Store, voce aceita e concorda em cumprir estes termos de uso.
            Se voce nao concordar com qualquer parte destes termos, nao devera usar nosso servico.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">2. Descricao do Servico</h2>
          <p>
            O ARX Store e uma plataforma que fornece bots profissionais para servidores Discord.
            Oferecemos planos gratuitos e pagos com diferentes niveis de funcionalidade.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">3. Contas e Registro</h2>
          <p>
            Para acessar os servicos, voce deve criar uma conta usando Discord ou ARX Auth.
            Voce e responsavel por manter a seguranca de suas credenciais.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">4. Pagamentos e Assinaturas</h2>
          <p>
            Os pagamentos sao processados via Mercado Pago. Assinaturas podem ser canceladas
            a qualquer momento pelo painel do usuario. Nao oferecemos reembolso apos o periodo
            de 7 dias.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">5. Uso Aceitavel</h2>
          <p>
            Voce concorda em nao usar nossos bots para spam, assedio, atividades ilegais ou
            qualquer violacao dos Termos de Servico do Discord.
          </p>

          <h2 className="text-xl font-bold text-white mt-8">6. Contato</h2>
          <p>
            Para duvidas sobre estes termos, entre em contato pelo nosso servidor Discord
            ou envie um email para suporte@arxdevs.xyz.
          </p>
        </div>
      </div>
    </div>
  )
}

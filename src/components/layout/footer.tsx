import Link from 'next/link'

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {year} ARX Store. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/termos"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Termos
          </Link>
          <Link
            href="/privacidade"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}

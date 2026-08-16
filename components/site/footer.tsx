import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="flex flex-col items-center justify-between gap-3 border-t border-[#E6E4DF] px-6 py-6 sm:flex-row sm:px-12">
      <span className="font-heading text-base font-extrabold text-[#1A1A1A]">
        Au<span className="text-[#C93A1A]">Toninho</span>
      </span>
      <div className="flex items-center gap-4 font-body text-xs font-medium text-[#6B6B68]">
        <Link href="/politica-de-privacidade" className="hover:text-[#C93A1A]">
          Política de privacidade
        </Link>
        <span>© {new Date().getFullYear()} AuToninho. Todos os direitos reservados.</span>
      </div>
    </footer>
  )
}

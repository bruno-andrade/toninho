export function SiteFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-[#E6E4DF] px-6 py-6 sm:px-12">
      <span className="font-heading text-base font-extrabold text-[#1A1A1A]">
        Au<span className="text-[#FF5A36]">Toninho</span>
      </span>
      <span className="font-body text-xs font-medium text-[#A8A59C]">
        © {new Date().getFullYear()} AuToninho. Todos os direitos reservados.
      </span>
    </footer>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-black/8 bg-[#0d0d0d] px-6 py-12 text-white sm:px-20">
      <div className="mx-auto flex max-w-[1384px] flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <span className="text-xl font-bold tracking-tight">Iced Latte ☕</span>
          <p className="max-w-xs text-sm text-white/50">A community-built open-source coffee marketplace. Specialty beans, delivered.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-white/60">
          <span className="mb-1 font-semibold text-white">Contact</span>
          <a href="tel:(555) 123-4567" className="transition hover:text-white">📞 (555) 123-4567</a>
          <a href="mailto:info@coffeetimecafe.com" className="transition hover:text-white">✉️ info@coffeetimecafe.com</a>
        </div>
        <div className="text-sm text-white/40">© 2024 Iced Latte. MIT License.</div>
      </div>
    </footer>
  )
}

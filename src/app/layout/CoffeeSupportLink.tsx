import { SiBuymeacoffee } from 'react-icons/si'
import { EXTERNAL_LINKS } from '@/shared/config/links'

export default function CoffeeSupportLink({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={EXTERNAL_LINKS.buyMeACoffee}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support this project on Buy Me a Coffee (opens in a new tab)"
      title="Support Iced Latte on Buy Me a Coffee"
      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#FFDD00] px-3 text-[13px] font-semibold text-black transition-colors hover:bg-[#F3CE00] focus-visible:ring-2 focus-visible:ring-[#FFDD00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <SiBuymeacoffee className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {compact ? (
        <>
          <span className="max-[359px]:hidden sm:hidden">Support</span>
          <span className="hidden sm:inline">Support this project</span>
        </>
      ) : (
        <span>Support this project</span>
      )}
    </a>
  )
}

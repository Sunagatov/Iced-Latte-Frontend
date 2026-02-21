# UI Improvements Changelog

## Planned

### Hero Section
- [ ] Replace scaled PNG with full-width gradient banner (`from-[#1a0533] via-[#2d1060] to-[#682EFF]`)
- [ ] Add bold headline, subtext, and "Shop Now" CTA button
- [ ] Add radial gradient overlay for depth

### Header
- [ ] Frosted glass effect (`bg-white/80 backdrop-blur-md`)
- [ ] Replace `mt-2` with `top-0`, reduce height to `h-16`
- [ ] Add subtle bottom border (`border-b border-black/5`)

### Product Cards
- [ ] Rounder corners (`rounded-xl`)
- [ ] Softer border (`border-black/8`)
- [ ] Add base shadow + stronger hover shadow (`shadow-sm hover:shadow-lg`)
- [ ] Reduce hover translate to `-translate-y-1`

### Filter Sidebar
- [ ] Wrap in light card background (`bg-[#F9F9FB] rounded-xl p-4`)

### Footer
- [ ] Dark structured layout with brand name, links, copyright
- [ ] Two-column grid on desktop

### Global
- [ ] Smooth scrolling (`scroll-behavior: smooth`)
- [ ] Font antialiasing (`-webkit-font-smoothing: antialiased`)

---

## Completed

| Date | Change |
|------|--------|
| 2026-02-21 | Restored Tailwind v4 default color palette (`@import "tailwindcss/theme"`) |
| 2026-02-21 | Fixed Tailwind v4 color token collision between `bg-*` and `text-*` namespaces |
| 2026-02-21 | Fixed Hero `z-[-1]` hiding image behind sticky toolbar |
| 2026-02-21 | Added `@types/lodash`, fixed TypeScript build error |
| 2026-02-21 | Added 14 Playwright e2e filter tests |
| 2026-02-21 | Fixed price input regex (missing `g` flag allowed letters through) |
| 2026-02-21 | Fixed duplicate product key warning (SWR revalidation deduplication) |

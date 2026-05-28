"use client"

import React, { useRef } from 'react'

const partners = [
  { name: 'Vercel', href: 'https://vercel.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vercel.svg' },
  { name: 'Supabase', href: 'https://supabase.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/supabase.svg' },
  { name: 'Tailwind CSS', href: 'https://tailwindcss.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tailwindcss.svg' },
  { name: 'Stripe', href: 'https://stripe.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stripe.svg' },
  { name: 'GitHub', href: 'https://github.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg' },
]

export default function PartnerCarousel() {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const indexRef = useRef(0)

  // Auto-advance disabled to keep carousel manual

  function scrollTo(offset: number) {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <div className="mt-10 w-full px-4 sm:px-0">
      <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-4 text-center">Empresas aliadas</h3>

      <div className="relative max-w-4xl mx-auto">
        <button
          aria-label="Anterior"
          onClick={() => {
            const scroller = scrollerRef.current
            if (!scroller) return
            const first = scroller.querySelector('[data-item]') as HTMLElement | null
            const step = first ? first.offsetWidth + 16 : 220
            scrollTo(-step)
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/50"
        >
          ‹
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth py-2 scrollbar-hide snap-x snap-mandatory px-6 justify-center">
          {partners.map((p) => (
            <a
              key={p.name}
              data-item
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-40 h-16 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center snap-center p-2"
            >
              <img src={p.logo} alt={`${p.name} logo`} className="max-h-10 object-contain" />
            </a>
          ))}
        </div>

        <button
          aria-label="Siguiente"
          onClick={() => {
            const scroller = scrollerRef.current
            if (!scroller) return
            const first = scroller.querySelector('[data-item]') as HTMLElement | null
            const step = first ? first.offsetWidth + 16 : 220
            scrollTo(step)
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/50"
        >
          ›
        </button>
      </div>
    </div>
  )
}

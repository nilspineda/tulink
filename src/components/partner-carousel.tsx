"use client"

import React, { useRef, useState, useEffect } from 'react'

const partners = [
  { name: 'Vercel', href: 'https://vercel.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vercel.svg' },
  { name: 'Supabase', href: 'https://supabase.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/supabase.svg' },
  { name: 'Tailwind CSS', href: 'https://tailwindcss.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tailwindcss.svg' },
  { name: 'Stripe', href: 'https://stripe.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stripe.svg' },
  { name: 'Concepto Digital', href: 'https://conceptodigital.com.co', logo: 'https://conceptodigital.com.co/wp-content/uploads/2026/01/LOGO-2025-01-2048x949.png' },
  { name: 'GitHub', href: 'https://github.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg' },
]

export default function PartnerCarousel() {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const scroller = scrollerRef.current
    if (!scroller) return

    const interval = setInterval(() => {
      const first = scroller.querySelector('[data-item]') as HTMLElement | null
      const step = first ? first.offsetWidth + 16 : 220

      if (scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 10) {
        scroller.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scroller.scrollBy({ left: step, behavior: 'smooth' })
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [isPaused])

  function scrollTo(offset: number) {
    const scroller = scrollerRef.current
    if (!scroller) return
    const first = scroller.querySelector('[data-item]') as HTMLElement | null
    const step = first ? first.offsetWidth + 16 : 220
    scroller.scrollBy({ left: offset * step, behavior: 'smooth' })
  }

  return (
    <div className="mt-10 w-full px-4 sm:px-0">
      <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-6 text-center">Empresas aliadas</h3>

      <div
        className="relative max-w-5xl mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <button
          aria-label="Anterior"
          onClick={() => scrollTo(-1)}
          className="absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
        >
          <span className="text-xl leading-none">‹</span>
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto scroll-smooth py-2 scrollbar-hide snap-x snap-mandatory px-8 sm:px-12 justify-start sm:justify-center"
        >
          {partners.map((p, i) => (
            <a
              key={`${p.name}-${i}`}
              data-item
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-44 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center snap-center p-3 hover:bg-white/10 transition-colors"
            >
              <img src={p.logo} alt={`${p.name} logo`} className="max-h-10 object-contain" />
            </a>
          ))}
        </div>

        <button
          aria-label="Siguiente"
          onClick={() => scrollTo(1)}
          className="absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
        >
          <span className="text-xl leading-none">›</span>
        </button>
      </div>
    </div>
  )
}
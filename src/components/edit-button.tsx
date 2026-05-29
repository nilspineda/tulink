'use client'

import Link from 'next/link'

export default function EditButton() {
  return (
    <Link
      href="/dashboard"
      className="fixed bottom-6 right-6 z-50 bg-[#28af90] hover:bg-[#1e876e] text-white font-semibold text-xs py-3 px-5 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      <span>Editar Perfil</span>
    </Link>
  )
}

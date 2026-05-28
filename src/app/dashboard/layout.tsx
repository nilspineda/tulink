import Image from 'next/image'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Dashboard | tulink',
  description: 'Administra tu perfil, temas y enlaces públicos.',
}

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header del Dashboard */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="tulink logo"
              width={140}
              height={45}
              priority
              className="h-8 w-auto"
            /> |  <span className=" text-slate-400 ml-2"> | By Nilspineda</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs bg-[#28af90]/10 border border-[#28af90]/20 text-[#28af90] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Panel
            </span>
          </div>
        </div>
      </header>

      {/* Área del Contenido Principal */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}

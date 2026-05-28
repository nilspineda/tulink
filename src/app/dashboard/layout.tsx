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
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#28af90] to-[#1e876e] flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-[#28af90]/20">
              t
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-baseline">
              <span className="text-[#28af90]">tu</span>link
              <span className="text-[10px] text-slate-400 font-normal ml-1.5">by Nilspineda</span>
            </span>
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

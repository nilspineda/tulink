import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import HeaderUser from '@/components/header-user'

export const metadata = {
  title: 'Dashboard | tulink',
  description: 'Administra tu perfil, temas y enlaces públicos.',
}

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let username = ''
  let fullName: string | null = null
  let avatarUrl: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle()

    if (profile) {
      username = profile.username
      fullName = profile.full_name
      avatarUrl = profile.avatar_url
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header del Dashboard */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="tulink logo"
              width={140}
              height={45}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <HeaderUser
                user={{
                  id: user.id,
                  username,
                  full_name: fullName,
                  avatar_url: avatarUrl,
                  email: user.email || '',
                }}
              />
            ) : (
              <span className="text-xs bg-[#28af90]/10 border border-[#28af90]/20 text-[#28af90] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Panel
              </span>
            )}
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

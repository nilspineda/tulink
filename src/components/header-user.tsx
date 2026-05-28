'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, User, LogOut, ExternalLink, QrCode } from 'lucide-react'

interface UserData {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  email: string
}

interface HeaderUserProps {
  user: UserData
}

export default function HeaderUser({ user }: HeaderUserProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2 transition-all cursor-pointer"
      >
        <div className="w-7 h-7 rounded-full bg-[#28af90] flex items-center justify-center overflow-hidden">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt={user.full_name || user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-white">
              {user.full_name?.[0]?.toUpperCase() || user.username[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
          {user.full_name || user.username}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-xs font-semibold text-white truncate">{user.full_name || user.username}</p>
            <p className="text-[10px] text-slate-400 truncate">@{user.username}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href={`/${user.username}`}
              target="_blank"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-200">Ver mi perfil público</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-200">Ir al Panel</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-slate-700 py-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-950/30 transition-colors w-full cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-red-400">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

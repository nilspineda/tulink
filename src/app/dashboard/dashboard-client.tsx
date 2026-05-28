'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProfileForm from './profile-form'
import LinksManager from './links-manager'
import PhonePreview from './phone-preview'
import QRModal from '@/components/qr-modal'
import { 
  LogOut, Link2, User as UserIcon, ArrowLeft, 
  Smartphone, Edit3, ExternalLink, QrCode 
} from 'lucide-react'

interface LinkItem {
  id: string
  title: string
  url: string
  active: boolean
  sort_order: number
}

interface ProfileData {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  theme_color: string
}

interface DashboardClientProps {
  initialProfile: ProfileData
  initialLinks: LinkItem[]
}

export default function DashboardClient({
  initialProfile,
  initialLinks,
}: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<ProfileData>(initialProfile)
  const [links, setLinks] = useState<LinkItem[]>(initialLinks)
  const [activeTab, setActiveTab] = useState<'links' | 'profile'>('links')
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  // Cerrar Sesión
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  // Callback para actualizar el estado del perfil localmente
  const handleProfileUpdate = (updatedFields: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...updatedFields }))
  }

  // Callback para actualizar los enlaces localmente
  const handleLinksUpdate = (newLinks: LinkItem[]) => {
    const sorted = [...newLinks].sort((a, b) => a.sort_order - b.sort_order)
    setLinks(sorted)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      {/* Sub-Header con información de perfil público */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">
            ¡Hola, {profile.full_name || profile.username}!
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-slate-400">Tu enlace público:</span>
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#28af90] hover:text-[#1e876e] flex items-center gap-1 hover:underline"
            >
              <span>{origin ? origin.replace(/^https?:\/\//, '') : 'tulink.dev'}/{profile.username}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[#28af90] text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ml-2"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón alternar vista de teléfono en móviles */}
          <button
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="md:hidden flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            {showMobilePreview ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Editar</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4" />
                <span>Vista Previa</span>
              </>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/50 text-slate-350 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Contenedor Dual: Editor y Previsualización */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* LADO IZQUIERDO: Editor (Columnas 3/5 en Desktop) */}
        <div
          className={`md:col-span-3 space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)] pr-2 ${
            showMobilePreview ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Selectores de Pestaña */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-xs">
            <button
              onClick={() => setActiveTab('links')}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
                activeTab === 'links'
                  ? 'bg-[#28af90] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Enlaces</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#28af90] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Perfil y Temas</span>
            </button>
          </div>

          {/* Formulario Correspondiente */}
          {activeTab === 'links' ? (
            <LinksManager
              userId={profile.id}
              links={links}
              onLinksUpdate={handleLinksUpdate}
            />
          ) : (
            <ProfileForm
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
            />
          )}
        </div>

        {/* LADO DERECHO: Teléfono Virtual (Columnas 2/5 en Desktop) */}
        <div
          className={`md:col-span-2 md:block ${
            showMobilePreview ? 'block' : 'hidden'
          }`}
        >
          {showMobilePreview && (
            <button
              onClick={() => setShowMobilePreview(false)}
              className="md:hidden flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold mb-4 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a editar
            </button>
          )}

          <PhonePreview profile={profile} links={links} />
        </div>
      </div>

      <QRModal
        username={profile.username}
        origin={origin || 'https://tulink.dev'}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />

      <footer className="mt-auto pt-8 pb-6 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>
          Nilspineda (<a href="https://nilspineda.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400">nilspineda.com</a>)
        </p>
        <p className="mt-1">
          WhatsApp: <a href="https://wa.me/573167195500" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400">+57 316 7195500</a>
        </p>
      </footer>
    </div>
  )
}

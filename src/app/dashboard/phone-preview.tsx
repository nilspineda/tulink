'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  WhatsappIcon, YoutubeIcon, InstagramIcon, TiktokIcon,
  Facebook01Icon, LinkedinIcon, NewTwitterIcon, GithubIcon,
  MailIcon, ShoppingBag01Icon, HandshakeIcon, GlobeIcon
} from '@hugeicons/core-free-icons'

interface LinkItem {
  id: string
  title: string
  url: string
  active: boolean
  sort_order: number
}

interface ProfileData {
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  theme_color: string
}

interface PhonePreviewProps {
  profile: ProfileData
  links: LinkItem[]
}

export default function PhonePreview({ profile, links }: PhonePreviewProps) {
  const activeLinks = links.filter((link) => link.active)

  // Extraer redes sociales para la sección superior
  const instagramLink = links.find((l) => l.url.includes('instagram.com') && l.active)?.url
  const tiktokLink = links.find((l) => l.url.includes('tiktok.com') && l.active)?.url
  const emailLink = links.find((l) => (l.url.includes('mailto:') || l.url.includes('@')) && l.active)?.url

  // Mapear iconos para la lista de enlaces de forma coherente con Hugeicons
  const getLinkIcon = (url: string) => {
    const lowercaseUrl = url.toLowerCase()
    
    // 1. YouTube
    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
      return <HugeiconsIcon icon={YoutubeIcon} className="text-[#ff0000] shrink-0" size={18} />
    }
    // 2. Instagram
    if (lowercaseUrl.includes('instagram.com')) {
      return <HugeiconsIcon icon={InstagramIcon} className="text-[#e1306c] shrink-0" size={18} />
    }
    // 3. WhatsApp
    if (lowercaseUrl.includes('wa.me') || lowercaseUrl.includes('whatsapp.com')) {
      return <HugeiconsIcon icon={WhatsappIcon} className="text-[#25d366] shrink-0" size={18} />
    }
    // 4. TikTok
    if (lowercaseUrl.includes('tiktok.com')) {
      return <HugeiconsIcon icon={TiktokIcon} className="text-black dark:text-white shrink-0" size={18} />
    }
    // 5. Amazon o tiendas
    if (lowercaseUrl.includes('amazon.com') || lowercaseUrl.includes('amazon.co') || lowercaseUrl.includes('store') || lowercaseUrl.includes('tienda')) {
      return <HugeiconsIcon icon={ShoppingBag01Icon} className="text-[#ff9900] shrink-0" size={18} />
    }
    // 6. GitHub
    if (lowercaseUrl.includes('github.com')) {
      return <HugeiconsIcon icon={GithubIcon} className="text-black dark:text-white shrink-0" size={18} />
    }
    // 7. Facebook
    if (lowercaseUrl.includes('facebook.com')) {
      return <HugeiconsIcon icon={Facebook01Icon} className="text-[#1877f2] shrink-0" size={18} />
    }
    // 8. LinkedIn
    if (lowercaseUrl.includes('linkedin.com')) {
      return <HugeiconsIcon icon={LinkedinIcon} className="text-[#0077b5] shrink-0" size={18} />
    }
    // 9. Twitter / X
    if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) {
      return <HugeiconsIcon icon={NewTwitterIcon} className="text-black dark:text-white shrink-0" size={18} />
    }
    // 10. Colaboraciones / Handshake
    if (lowercaseUrl.includes('collab') || lowercaseUrl.includes('handshake') || lowercaseUrl.includes('contacto') || lowercaseUrl.includes('collaborations')) {
      return <HugeiconsIcon icon={HandshakeIcon} className="text-[#c2410c] shrink-0" size={18} />
    }
    // 11. Correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (lowercaseUrl.startsWith('mailto:') || emailRegex.test(lowercaseUrl.split('?')[0].split('/').pop() || '')) {
      return <HugeiconsIcon icon={MailIcon} className="text-[#2563eb] shrink-0" size={18} />
    }
    
    // Default
    return <HugeiconsIcon icon={GlobeIcon} className="text-slate-500 shrink-0" size={18} />
  }

  // Formatear email link
  const getEmailHref = (href: string) => {
    if (href.includes('@') && !href.startsWith('mailto:')) {
      return `mailto:${href}`
    }
    return href
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 sticky top-24">
      {/* Marco de Teléfono */}
      <div className="relative w-[300px] h-[600px] rounded-[40px] border-[12px] border-slate-900 bg-black shadow-2xl overflow-hidden flex flex-col">
        {/* Cámara frontal / Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-800"></div>
        </div>

        {/* Pantalla interna */}
        <div className="flex-1 w-full h-full overflow-y-auto flex flex-col bg-black text-white select-none custom-scrollbar pb-6 relative">
          
          {/* 1. Header con Imagen Principal */}
          <div className="relative w-full h-[280px] shrink-0 bg-slate-900 overflow-hidden">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Imagen'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#112d24] via-[#0b1a15] to-[#040807] flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-[#28af90]/30 tracking-wider">LNK</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black"></div>

            {/* Nombre sobrepuesto */}
            <div className="absolute bottom-1 w-full text-center px-4 z-10">
              <h3 className="font-bold text-xl tracking-tight text-white drop-shadow-md">
                {profile.full_name || `@${profile.username}`}
              </h3>
            </div>
          </div>

          {/* 2. Redes Sociales horizontales */}
          <div className="flex items-center justify-center gap-6 py-4 z-10 bg-black">
            {instagramLink && (
              <a href={instagramLink} target="_blank" rel="noreferrer" className="text-white hover:opacity-80 transition-opacity">
                <HugeiconsIcon icon={InstagramIcon} className="text-white" size={24} />
              </a>
            )}
            {tiktokLink && (
              <a href={tiktokLink} target="_blank" rel="noreferrer" className="text-white hover:opacity-80 transition-opacity">
                <HugeiconsIcon icon={TiktokIcon} className="text-white" size={24} />
              </a>
            )}
            {emailLink && (
              <a href={getEmailHref(emailLink)} className="text-white hover:opacity-80 transition-opacity">
                <HugeiconsIcon icon={MailIcon} className="text-white" size={24} />
              </a>
            )}
          </div>

          {/* 3. Enlaces Activos */}
          <div className="w-full px-6 flex flex-col gap-3">
            {activeLinks.length > 0 ? (
              activeLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 bg-white hover:bg-slate-100 text-black rounded-full flex items-center font-bold text-xs tracking-wider uppercase transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-md border-none group relative"
                >
                  <div className="absolute left-5 flex items-center justify-center w-5 h-5">
                    {getLinkIcon(link.url)}
                  </div>
                  <span className="w-full text-center pr-2 pl-6 truncate">
                    {link.title}
                  </span>
                </a>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-8">
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  Sin enlaces activos
                </span>
                <p className="text-[9px] mt-1 px-4">
                  Activa o añade enlaces para verlos aquí.
                </p>
              </div>
            )}
          </div>

          {/* Pie de Página */}
          <div className="mt-auto pt-8 pb-2 text-center">
            <span className="text-[9px] font-bold tracking-widest uppercase opacity-30">
              ⚡ tulink.dev by <a href="https://nilspineda.com" target="_blank" rel="noopener noreferrer" className="hover:underline">NilsPineda</a>
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-3 text-center">
        Vista previa en tiempo real
      </p>
    </div>
  )
}

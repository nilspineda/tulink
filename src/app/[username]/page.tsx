import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  WhatsappIcon, YoutubeIcon, InstagramIcon, TiktokIcon,
  Facebook01Icon, LinkedinIcon, NewTwitterIcon, GithubIcon,
  MailIcon, ShoppingBag01Icon, HandshakeIcon, GlobeIcon
} from '@hugeicons/core-free-icons'

const THEME_STYLES: Record<string, {
  main: string
  text: string
  gradient: string
  footer: string
  link: string
  linkHover: string
  nameOverlay: string
  bioColor: string
}> = {
  default: {
    main: 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300',
    text: 'text-slate-800',
    gradient: 'from-slate-100 via-slate-200 to-slate-300',
    footer: 'text-slate-600',
    link: 'bg-slate-900 hover:bg-slate-800 text-white',
    linkHover: 'hover:bg-slate-700',
    nameOverlay: 'text-white',
    bioColor: 'text-slate-200',
  },
  darkbento: {
    main: 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700',
    text: 'text-zinc-100',
    gradient: 'from-zinc-900 via-zinc-800 to-zinc-700',
    footer: 'text-zinc-400',
    link: 'bg-white hover:bg-zinc-200 text-black',
    linkHover: 'hover:bg-zinc-300',
    nameOverlay: 'text-white',
    bioColor: 'text-zinc-300',
  },
  glass: {
    main: 'bg-gradient-to-br from-teal-950 via-teal-900 to-cyan-900',
    text: 'text-teal-200',
    gradient: 'from-teal-950 via-teal-900 to-cyan-900',
    footer: 'text-teal-300',
    link: 'bg-teal-400/20 hover:bg-teal-400/30 text-teal-100 border border-teal-400/30',
    linkHover: 'hover:bg-teal-400/40',
    nameOverlay: 'text-white',
    bioColor: 'text-teal-200',
  },
  sunset: {
    main: 'bg-gradient-to-br from-amber-100 via-orange-200 to-red-200',
    text: 'text-orange-950',
    gradient: 'from-amber-100 via-orange-200 to-red-200',
    footer: 'text-orange-700',
    link: 'bg-orange-900 hover:bg-orange-800 text-white',
    linkHover: 'hover:bg-orange-700',
    nameOverlay: 'text-white',
    bioColor: 'text-orange-100',
  },
  cyberpunk: {
    main: 'bg-gradient-to-br from-purple-950 via-purple-900 to-pink-900',
    text: 'text-green-400',
    gradient: 'from-purple-950 via-purple-900 to-pink-900',
    footer: 'text-green-300',
    link: 'bg-black hover:bg-gray-900 text-green-400 border border-green-400/50',
    linkHover: 'hover:bg-gray-900',
    nameOverlay: 'text-green-400',
    bioColor: 'text-green-300',
  },
  neobrutalism: {
    main: 'bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400',
    text: 'text-black',
    gradient: 'from-yellow-200 via-yellow-300 to-yellow-400',
    footer: 'text-black/60',
    link: 'bg-black hover:bg-gray-900 text-white',
    linkHover: 'hover:bg-gray-800',
    nameOverlay: 'text-black',
    bioColor: 'text-black/70',
  },
}

interface PageProps {
  params: Promise<{ username: string }>
}

// 1. Configuración de SEO dinámico y Metadatos de OpenGraph
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (!profile) {
    return {
      title: 'Perfil no encontrado | tulink',
    }
  }

  const title = `${profile.full_name || `@${username}`} | Enlaces`
  const description = profile.bio || `Conéctate con @${username} a través de sus enlaces importantes.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
      type: 'profile',
      username: username,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}

// 2. Componente de Servidor de la página pública
export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Obtener Perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  // Incrementar visitas en segundo plano
  supabase.rpc('increment_profile_views', { profile_id: profile.id }).then(({ error }) => {
    if (error) console.error('Error al incrementar vistas:', error)
  })

  // Obtener Enlaces Activos
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  // Extraer redes sociales para la sección de iconos
  const activeLinks = links || []
  const instagramLink = activeLinks.find((l) => l.url.includes('instagram.com'))?.url
  const tiktokLink = activeLinks.find((l) => l.url.includes('tiktok.com'))?.url

  // Extraer el primer video embebido
  const videoLink = activeLinks.find((l) => l.embed_type === 'video')
  const normalLinks = activeLinks.filter((l) => l.embed_type !== 'video')

  // Función para convertir URL de video a formato embed
  const getEmbedUrl = (url: string) => {
    // YouTube - varios formatos
    if (url.includes('youtube.com/watch')) {
      return url.replace('watch?v=', 'embed/')
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/')
    }
    if (url.includes('youtube.com/embed/')) {
      return url
    }
    if (url.includes('youtube.com/@')) {
      // Canales de YouTube - convertir a embed
      const channelMatch = url.match(/youtube\.com\/@([^/?]+)/)
      if (channelMatch) {
        return `https://www.youtube.com/embed/${channelMatch[1]}`
      }
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
      if (url.includes('player.vimeo.com')) {
        return url
      }
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
      if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`
      }
    }
    return url
  }

  // Obtener tema del perfil
  const theme = THEME_STYLES[profile.theme_color] || THEME_STYLES.default

  // Mapear iconos de links de forma coherente con Hugeicons
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
      return <HugeiconsIcon icon={TiktokIcon} className="text-black shrink-0" size={18} />
    }
    // 5. Amazon o tiendas
    if (lowercaseUrl.includes('amazon.com') || lowercaseUrl.includes('amazon.co') || lowercaseUrl.includes('store') || lowercaseUrl.includes('tienda')) {
      return <HugeiconsIcon icon={ShoppingBag01Icon} className="text-[#ff9900] shrink-0" size={18} />
    }
    // 6. GitHub
    if (lowercaseUrl.includes('github.com')) {
      return <HugeiconsIcon icon={GithubIcon} className="text-black shrink-0" size={18} />
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
      return <HugeiconsIcon icon={NewTwitterIcon} className="text-black shrink-0" size={18} />
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



  return (
    <main className={`min-h-screen w-full ${theme.main} ${theme.text} flex flex-col items-center pb-12 transition-colors duration-300 relative select-none`}>
      <div className="w-full max-w-md flex flex-col items-center">

        {/* 1. Header con Imagen Principal */}
        <div className={`relative w-full h-[380px] shrink-0 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'Imagen'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center`}>
              <span className="text-5xl font-black text-[#28af90]/20 tracking-widest">TULINK</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/35 to-black"></div>

          {/* Nombre sobrepuesto */}
          <div className="absolute bottom-4 w-full text-center px-6 z-10">
            <h1 className={`font-extrabold text-2xl sm:text-3xl tracking-tight ${theme.nameOverlay} drop-shadow-md`}>
              {profile.full_name || `@${profile.username}`}
            </h1>

            {profile.bio && (
              <p className={`text-xs ${theme.bioColor} mt-2 font-medium max-w-sm mx-auto drop-shadow-sm whitespace-pre-wrap`}>
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* 2. Redes Sociales horizontales */}
        <div className={`flex items-center justify-center gap-6 py-5 z-10 w-full ${theme.main}`}>
          {instagramLink && (
            <a href={instagramLink} target="_blank" rel="noreferrer" className={`${theme.text} hover:opacity-85 transition-opacity p-2`}>
              <HugeiconsIcon icon={InstagramIcon} className={theme.text} size={26} />
            </a>
          )}
          {tiktokLink && (
            <a href={tiktokLink} target="_blank" rel="noreferrer" className={`${theme.text} hover:opacity-85 transition-opacity p-2`}>
              <HugeiconsIcon icon={TiktokIcon} className={theme.text} size={26} />
            </a>
          )}
        </div>

        {/* 3. Video Embebido (máx 1, debajo del nombre y redes, arriba de los botones) */}
        {videoLink && (
          <div className="w-full px-6 py-4 z-10">
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
              <iframe
                src={getEmbedUrl(videoLink.url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={videoLink.title}
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* 4. Enlaces Activos (solo botones, sin videos) */}
        <div className="w-full px-6 flex flex-col gap-4 mb-16 z-10">
          {normalLinks.length > 0 ? (
            normalLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 px-6 ${theme.link} rounded-full flex items-center font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-md border-none group relative cursor-pointer`}
              >
                <div className="absolute left-6 flex items-center justify-center w-5 h-5">
                  {getLinkIcon(link.url)}
                </div>
                <span className="w-full text-center pr-2 pl-6 truncate">
                  {link.title}
                </span>
              </a>
            ))
          ) : (
            <div className="text-center py-16 opacity-40 bg-zinc-900/20 border border-zinc-800/30 rounded-3xl">
              <p className="text-xs font-semibold">Este perfil aún no tiene enlaces públicos.</p>
            </div>
          )}
        </div>

        {/* Pie de Página */}
        <footer className={`mt-auto pt-4 pb-4 text-center font-sans ${theme.footer} flex items-center justify-center gap-2 text-xs`}>
          <span>Creado por:</span>
          <a href="https://nilspineda.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">nilspineda</a>
          <span>|</span>
          <a href="https://wa.me/573167195500" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </footer>
      </div>
    </main>
  )
}

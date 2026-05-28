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
    <main className="min-h-screen w-full bg-black text-white flex flex-col items-center pb-12 transition-colors duration-300 relative select-none">
      <div className="w-full max-w-md flex flex-col items-center">

        {/* 1. Header con Imagen Principal */}
        <div className="relative w-full h-[380px] shrink-0 bg-slate-900 overflow-hidden">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'Imagen'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#112d24] via-[#0b1a15] to-[#040807] flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-[#28af90]/20 tracking-widest">TULINK</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/35 to-black"></div>

          {/* Nombre sobrepuesto */}
          <div className="absolute bottom-4 w-full text-center px-6 z-10">
            <h1 className="font-extrabold text-2xl sm:text-3xl tracking-tight text-white drop-shadow-md">
              {profile.full_name || `@${profile.username}`}
            </h1>

            {profile.bio && (
              <p className="text-xs text-slate-300 mt-2 font-medium max-w-sm mx-auto drop-shadow-sm whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* 2. Redes Sociales horizontales */}
        <div className="flex items-center justify-center gap-6 py-5 z-10 w-full bg-black">
          {instagramLink && (
            <a href={instagramLink} target="_blank" rel="noreferrer" className="text-white hover:opacity-85 transition-opacity p-2">
              <HugeiconsIcon icon={InstagramIcon} className="text-white" size={26} />
            </a>
          )}
          {tiktokLink && (
            <a href={tiktokLink} target="_blank" rel="noreferrer" className="text-white hover:opacity-85 transition-opacity p-2">
              <HugeiconsIcon icon={TiktokIcon} className="text-white" size={26} />
            </a>
          )}

        </div>

        {/* 3. Enlaces Activos */}
        <div className="w-full px-6 flex flex-col gap-4 mb-16 z-10">
          {activeLinks.length > 0 ? (
            activeLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-black rounded-full flex items-center font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-md border-none group relative cursor-pointer"
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
        <footer className="mt-auto pt-4 text-center font-sans">
          <Link
            href="/"
            className="text-[10px] font-bold tracking-widest uppercase opacity-35 hover:opacity-80 transition-opacity duration-200"
          >
            ⚡ Creado con tulink by Nilspineda
          </Link>
          <img src="/logo.svg" alt="" />
        </footer>
      </div>
    </main>
  )
}

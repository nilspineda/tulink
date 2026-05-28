import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  YoutubeIcon, InstagramIcon, TiktokIcon,
  Facebook01Icon, LinkedinIcon, NewTwitterIcon, GithubIcon,
  MailIcon, ShoppingBag01Icon, HandshakeIcon, GlobeIcon, WhatsappIcon
} from '@hugeicons/core-free-icons'
import EditButton from '@/components/edit-button'

interface PageProps {
  params: Promise<{ username: string }>
}

function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16) / 255) || [0, 0, 0]
  const [r, g, b] = rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (!profile) {
    return { title: 'Perfil no encontrado | tulink' }
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

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  supabase.rpc('increment_profile_views', { profile_id: profile.id }).then(({ error }) => {
    if (error) console.error('Error al incrementar vistas:', error)
  })

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  const activeLinks = links || []
  const instagramLink = activeLinks.find((l) => l.url.includes('instagram.com'))?.url
  const tiktokLink = activeLinks.find((l) => l.url.includes('tiktok.com'))?.url

  const videoLink = activeLinks.find((l) => l.embed_type === 'video')
  const normalLinks = activeLinks.filter((l) => l.embed_type !== 'video')

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoMatch = url.match(/youtube\.com\/watch\?.*v=([^&]+)/)
      if (videoMatch) return `https://www.youtube.com/embed/${videoMatch[1]}`
    }
    if (url.includes('youtu.be/')) {
      const shortMatch = url.match(/youtu\.be\/([^?]+)/)
      if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
    }
    if (url.includes('youtube.com/embed/')) return url.split('?')[0]
    if (url.includes('youtube.com/@')) {
      const channelMatch = url.match(/youtube\.com\/@([^/?]+)/)
      if (channelMatch) return `https://www.youtube.com/embed/${channelMatch[1]}`
    }
    if (url.includes('vimeo.com/')) {
      if (url.includes('player.vimeo.com')) return url.split('?')[0]
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }
    return url
  }

  const bgLuminance = profile.background_type === 'gradient'
    ? getLuminance(profile.background_color_end)
    : getLuminance(profile.background_color || '#020617')

  const textColorClass = bgLuminance > 0.5 ? 'text-slate-900' : 'text-white'
  const btnBgClass = bgLuminance > 0.5 ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-slate-100'
  const btnTextClass = bgLuminance > 0.5 ? 'text-white' : 'text-slate-900'
  const subtleTextClass = bgLuminance > 0.5 ? 'text-slate-600' : 'text-slate-400'

  const isOwner = user?.id === profile.id

  const getLinkIcon = (url: string) => {
    const lowercaseUrl = url.toLowerCase()
    if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
      return <HugeiconsIcon icon={YoutubeIcon} className="text-[#ff0000] shrink-0" size={18} />
    }
    if (lowercaseUrl.includes('instagram.com')) {
      return <HugeiconsIcon icon={InstagramIcon} className="text-[#e1306c] shrink-0" size={18} />
    }
    if (lowercaseUrl.includes('wa.me') || lowercaseUrl.includes('whatsapp.com')) {
      return <HugeiconsIcon icon={WhatsappIcon} className="text-[#25d366] shrink-0" size={18} />
    }
    if (lowercaseUrl.includes('tiktok.com')) {
      return <HugeiconsIcon icon={TiktokIcon} className="text-black shrink-0" size={18} />
    }
    if (lowercaseUrl.includes('amazon.com') || lowercaseUrl.includes('amazon.co') || lowercaseUrl.includes('store') || lowercaseUrl.includes('tienda')) {
      return <HugeiconsIcon icon={ShoppingBag01Icon} className="text-[#ff9900] shrink-0" size={18} />
    }
    if (lowercaseUrl.includes('github.com')) {
      return <HugeiconsIcon icon={GithubIcon} className="text-black shrink-0" size={18} />
    }
    if (lowercaseUrl.includes('facebook.com')) {
      return <HugeiconsIcon icon={Facebook01Icon} className="text-[#1877f2] shrink-0" size={18} />
    }
    if (lowercaseUrl.includes('linkedin.com')) {
      return <HugeiconsIcon icon={LinkedinIcon} className="text-[#0077b5] shrink-0" size={18} />
    }
    if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) {
      return <HugeiconsIcon icon={NewTwitterIcon} className="text-black shrink-0" size={18} />
    }
    if (lowercaseUrl.includes('collab') || lowercaseUrl.includes('handshake') || lowercaseUrl.includes('contacto') || lowercaseUrl.includes('collaborations')) {
      return <HugeiconsIcon icon={HandshakeIcon} className="text-[#c2410c] shrink-0" size={18} />
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (lowercaseUrl.startsWith('mailto:') || emailRegex.test(lowercaseUrl.split('?')[0].split('/').pop() || '')) {
      return <HugeiconsIcon icon={MailIcon} className="text-[#2563eb] shrink-0" size={18} />
    }
    return <HugeiconsIcon icon={GlobeIcon} className="text-slate-500 shrink-0" size={18} />
  }

  const getBgStyle = () => {
    if (profile.background_type === 'solid') {
      return { backgroundColor: profile.background_color || '#020617' }
    }
    if (profile.background_type === 'gradient') {
      return { background: `linear-gradient(to bottom, ${profile.background_color}, ${profile.background_color_end})` }
    }
    if (profile.background_type === 'image' && profile.background_url) {
      return {
        backgroundImage: `url(${profile.background_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return { backgroundColor: '#020617' }
  }

  return (
    <main className={`min-h-screen w-full flex flex-col items-center pb-12 pt-12 transition-colors duration-300 relative select-none ${textColorClass}`} style={getBgStyle()}>
      {profile.background_type === 'image' && profile.background_url && (
        <div className="fixed inset-0 bg-black/75 z-0 pointer-events-none"></div>
      )}

      {isOwner && <EditButton username={profile.username} />}

      <div className="w-full max-w-md flex flex-col items-center relative z-10">

        <div className="relative w-full h-[320px] sm:h-[360px] shrink-0 overflow-hidden rounded-2xl border border-white/10">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.full_name || 'Imagen'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-[#28af90]/20 tracking-widest">TULINK</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/5"></div>
          <div className="hidden sm:block w-full h-16"></div>
          <div className="absolute bottom-4 w-full text-center px-6 z-10">
            <h1 className={`font-extrabold text-2xl sm:text-3xl tracking-tight ${textColorClass} drop-shadow-md`}>
              {profile.full_name || `@${profile.username}`}
            </h1>
            {profile.bio && (
              <p className={`text-xs ${subtleTextClass} mt-2 font-medium max-w-sm mx-auto drop-shadow-sm whitespace-pre-wrap`}>
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 py-5 z-10 w-full bg-black/20">
          {instagramLink && (
            <a href={instagramLink} target="_blank" rel="noreferrer" className={`${textColorClass} hover:opacity-85 transition-opacity p-2`}>
              <HugeiconsIcon icon={InstagramIcon} className={textColorClass} size={26} />
            </a>
          )}
          {tiktokLink && (
            <a href={tiktokLink} target="_blank" rel="noreferrer" className={`${textColorClass} hover:opacity-85 transition-opacity p-2`}>
              <HugeiconsIcon icon={TiktokIcon} className={textColorClass} size={26} />
            </a>
          )}
        </div>

        {videoLink && (
          <div className="w-full px-6 py-4 z-10">
            <div className="w-full max-w-md mx-auto aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
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

        {normalLinks.length === 0 ? (
          <div className="w-full px-6 py-16 text-center opacity-40 bg-zinc-900/20 border border-zinc-800/30 rounded-3xl mb-16">
            <p className="text-xs font-semibold">Este perfil aún no tiene enlaces públicos.</p>
          </div>
        ) : (
          <div className="w-full px-6 flex flex-col gap-4 mb-16 z-10">
            {normalLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 px-6 ${btnBgClass} ${btnTextClass} rounded-full flex items-center font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-md relative cursor-pointer`}
              >
                <div className="absolute left-6 flex items-center justify-center w-5 h-5">
                  {getLinkIcon(link.url)}
                </div>
                <span className="w-full text-center pr-2 pl-6 truncate">{link.title}</span>
              </a>
            ))}
          </div>
        )}

        <footer className={`mt-auto pt-4 pb-4 text-center font-sans ${subtleTextClass} flex items-center justify-center gap-2 text-xs`}>
          <span>Creado por:</span>
          <a href="https://nilspineda.com" target="_blank" rel="noopener noreferrer" className={`font-bold hover:underline ${textColorClass}`}>nilspineda</a>
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

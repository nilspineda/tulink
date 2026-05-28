import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, Eye, Search, LogOut, ArrowLeft, ShieldAlert } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function AdminPage({ searchParams }: PageProps) {
  const { q = '' } = await searchParams
  const supabase = await createClient()

  // 1. Verificar sesión del usuario
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Verificar rol de administrador
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !profile.is_admin) {
    // Retornar pantalla de error 403 Forbidden
    return (
      <main className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-950/30 border border-red-900 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Acceso Denegado</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              No tienes los privilegios necesarios para acceder al panel de administración. Si crees que esto es un error, por favor contacta con soporte.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 bg-[#28af90] hover:bg-[#1e876e] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // 3. Obtener todas las cuentas registradas con sus enlaces
  let queryBuilder = supabase
    .from('profiles')
    .select(`
      *,
      links (
        url
      )
    `)
    .order('created_at', { ascending: false })

  if (q.trim()) {
    const searchTerm = `%${q.trim().toLowerCase()}%`
    queryBuilder = queryBuilder.or(
      `username.ilike.${searchTerm},full_name.ilike.${searchTerm},email.ilike.${searchTerm}`
    )
  }

  const { data: allProfiles, error } = await queryBuilder

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center">
        <p className="text-red-400 font-semibold">Error al cargar los perfiles: {error.message}</p>
      </main>
    )
  }

  const profilesList = allProfiles || []

  // Extraer WhatsApp de los enlaces
  const getWhatsApp = (links: { url: string }[] | undefined) => {
    if (!links || links.length === 0) return null
    const waLink = links.find((l) => l.url.includes('wa.me') || l.url.includes('whatsapp.com'))
    if (!waLink) return null
    const match = waLink.url.match(/wa\.me\/(\d+)/)
    if (match) {
      const num = match[1]
      return `+${num.substring(0, 2)} ${num.substring(2)}`
    }
    return waLink.url
  }

  // Calcular métricas
  const totalUsers = profilesList.length
  const totalViews = profilesList.reduce((acc, curr) => acc + (curr.views || 0), 0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <Image
                src="/logo.svg"
                alt="tulink logo"
                width={130}
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link> 
            
            <span className="text-xs bg-red-950/30 border border-red-900/50 text-red-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold px-4 py-2 rounded-xl transition-all"
            >
              Mi Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metricas de Cabecera */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-lg">
            <div className="p-4 bg-[#28af90]/10 border border-[#28af90]/25 text-[#28af90] rounded-2xl shrink-0">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Usuarios Registrados</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{totalUsers}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-lg">
            <div className="p-4 bg-teal-500/10 border border-teal-500/25 text-teal-400 rounded-2xl shrink-0">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Visitas a Perfiles</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{totalViews}</h3>
            </div>
          </div>
        </section>

        {/* Buscador y Filtro */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <form method="GET" className="relative flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Buscar por usuario, nombre completo o correo..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#28af90] hover:bg-[#1e876e] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 text-sm cursor-pointer shrink-0"
              >
                Buscar
              </button>
              {q && (
                <Link
                  href="/admin"
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white font-semibold px-4 py-3 rounded-xl transition-all text-sm flex items-center justify-center shrink-0"
                >
                  Limpiar
                </Link>
              )}
            </div>
          </form>
        </section>

        {/* Tabla de Usuarios */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuario</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Correo</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha Registro</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Visitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {profilesList.length > 0 ? (
                  profilesList.map((userProfile) => {
                    const registerDate = new Date(userProfile.created_at).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })

                    return (
                      <tr key={userProfile.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                              {userProfile.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={userProfile.avatar_url}
                                  alt={userProfile.full_name || userProfile.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                                  {userProfile.username.substring(0, 2)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{userProfile.full_name || 'Sin nombre'}</span>
                                {userProfile.is_admin && (
                                  <span className="text-[9px] bg-red-950/40 border border-red-900/60 text-red-400 font-bold px-1.5 py-0.5 rounded uppercase">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <a
                                href={`/${userProfile.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#28af90] hover:underline"
                              >
                                @{userProfile.username}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-350">
                          {userProfile.email || <span className="opacity-30 italic text-xs">Sin registrar</span>}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-400">
                          {registerDate}
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-white text-right">
                          {(userProfile.views || 0).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-500">
                      Ningún usuario coincide con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-auto pt-8 pb-6 text-center text-xs text-slate-500 border-t border-slate-900">
          <p>
            Nilspineda (<a href="https://nilspineda.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400">nilspineda.com</a>)
          </p>
          <p className="mt-1">
            WhatsApp: <a href="https://wa.me/573167195500" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400">+57 316 7195500</a>
          </p>
        </footer>

      </main>
    </div>
  )
}

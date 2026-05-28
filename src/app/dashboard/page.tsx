import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Obtener la sesión del usuario
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Obtener el perfil del usuario
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Si hay un error al obtener el perfil, pero el usuario está autenticado
  // (por ejemplo, el trigger falló o aún no se ha creado), redirigir
  if (profileError || !profile) {
    // Intentar cerrar sesión si el perfil está roto para limpiar cookies corruptas
    await supabase.auth.signOut()
    redirect('/login?error=profile_not_found')
  }

  // 3. Obtener los enlaces ordenados por sort_order
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  return (
    <DashboardClient
      initialProfile={profile}
      initialLinks={links || []}
    />
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_url, background_type, background_color, background_color_end, background_url, views, is_admin')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    await supabase.auth.signOut()
    redirect('/login?error=profile_not_found')
  }

  const { data: links } = await supabase
    .from('links')
    .select('id, title, url, embed_type, active, sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  return (
    <DashboardClient
      initialProfile={profile}
      initialLinks={links || []}
    />
  )
}

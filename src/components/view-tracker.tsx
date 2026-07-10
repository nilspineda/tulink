'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface ViewTrackerProps {
  profileId: string
  isOwner: boolean
}

export default function ViewTracker({ profileId, isOwner }: ViewTrackerProps) {
  useEffect(() => {
    if (isOwner) return

    const trackView = async () => {
      try {
        await supabase.rpc('increment_profile_views', { profile_id: profileId })
      } catch (error) {
        console.error('Error al incrementar vistas:', error)
      }
    }

    trackView()
  }, [profileId, isOwner])

  return null
}

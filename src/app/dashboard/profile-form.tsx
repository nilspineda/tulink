'use client'

import { useState, ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Upload, Trash2, Check } from 'lucide-react'

interface ProfileData {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  theme_color: string
}

interface ProfileFormProps {
  profile: ProfileData
  onProfileUpdate: (updated: Partial<ProfileData>) => void
}

const THEME_PRESETS = [
  { id: 'default', name: 'Original Light', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-350' },
  { id: 'darkbento', name: 'Dark Bento', bg: 'bg-zinc-900', text: 'text-zinc-100', border: 'border-zinc-700' },
  { id: 'glass', name: 'Glassmorphic', bg: 'bg-teal-950', text: 'text-teal-200', border: 'border-teal-800' },
  { id: 'sunset', name: 'Sunset Minimal', bg: 'bg-amber-100', text: 'text-orange-950', border: 'border-amber-300' },
  { id: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-purple-950', text: 'text-green-400', border: 'border-pink-650' },
  { id: 'neobrutalism', name: 'Neo-Brutalism', bg: 'bg-yellow-200', text: 'text-black', border: 'border-black' },
]

export default function ProfileForm({ profile, onProfileUpdate }: ProfileFormProps) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Guardar Info Básica
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
        })
        .eq('id', profile.id)

      if (error) throw error

      onProfileUpdate({ full_name: fullName, bio: bio })
      toast.success('¡Perfil guardado con éxito!')
    } catch (error: any) {
      toast.error(`Error al guardar perfil: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Cambio de tema
  const handleThemeChange = async (themeId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme_color: themeId })
        .eq('id', profile.id)

      if (error) throw error

      onProfileUpdate({ theme_color: themeId })
      toast.success('Tema actualizado con éxito')
    } catch (error: any) {
      toast.error(`Error al actualizar tema: ${error.message}`)
    }
  }

  // Subir Avatar
  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setIsUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/avatar_${Date.now()}.${fileExt}`

      // Subir archivo al bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Actualizar Base de datos
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (dbError) throw dbError

      onProfileUpdate({ avatar_url: publicUrl })
      toast.success('¡Imagen de perfil subida con éxito!')
    } catch (error: any) {
      toast.error(`Error al subir imagen: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Eliminar Avatar
  const handleAvatarDelete = async () => {
    if (!profile.avatar_url) return
    setIsUploading(true)

    try {
      // Eliminar el avatar de la base de datos
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id)

      if (dbError) throw dbError

      onProfileUpdate({ avatar_url: null })
      toast.success('Imagen de perfil eliminada.')
    } catch (error: any) {
      toast.error(`Error al eliminar imagen: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Subir Avatar */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Imagen de Perfil</h3>
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Avatar'}
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-semibold text-lg border-2 border-slate-700">
                {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase()}
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#28af90] animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 bg-[#28af90] hover:bg-[#1e876e] text-white font-semibold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-colors duration-200">
              <Upload className="w-4 h-4" />
              <span>Subir foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {profile.avatar_url && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                disabled={isUploading}
                className="flex items-center gap-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900 border border-slate-700 text-slate-350 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Información Básica */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Información de Perfil</h3>
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Nombre a Mostrar
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Biografía
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escribe algo sobre ti..."
              rows={3}
              maxLength={150}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-sm resize-none"
            />
            <p className="text-[10px] text-slate-500 text-right mt-1">
              {bio.length}/150 caracteres
            </p>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#28af90] hover:bg-[#1e876e] disabled:bg-[#28af90]/50 disabled:cursor-not-allowed text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Guardar perfil</span>
            </button>
          </div>
        </form>
      </section>

      {/* 3. Selección de Temas */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-2">Diseño y Temas</h3>
        <p className="text-xs text-slate-400 mb-5">
          Elige una paleta de colores para tu página de enlaces
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {THEME_PRESETS.map((theme) => {
            const isSelected = profile.theme_color === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeChange(theme.id)}
                className={`relative flex flex-col p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${
                  isSelected
                    ? 'border-[#28af90] ring-2 ring-[#28af90]/20 bg-slate-850'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className={`w-full h-8 rounded-md ${theme.bg} ${theme.border} border mb-3 flex items-center justify-center`}>
                  <span className={`text-[10px] font-bold ${theme.text}`}>Aa</span>
                </div>
                <span className="text-xs font-bold text-white">{theme.name}</span>
                
                {isSelected && (
                  <span className="absolute top-2 right-2 bg-[#28af90] text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

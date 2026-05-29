'use client'

import { useState, ChangeEvent } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Upload, Trash2, Palette, Image as ImageIcon, Share } from 'lucide-react'

interface ProfileData {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  background_type: 'solid' | 'gradient' | 'image'
  background_color: string
  background_color_end: string
  background_url: string | null
}

interface ProfileFormProps {
  profile: ProfileData
  onProfileUpdate: (updated: Partial<ProfileData>) => void
}

export default function ProfileForm({ profile, onProfileUpdate }: ProfileFormProps) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingBg, setIsUploadingBg] = useState(false)

  const [bgType, setBgType] = useState<'solid' | 'gradient' | 'image'>(profile.background_type || 'solid')
  const [bgColor, setBgColor] = useState(profile.background_color || '#020617')
  const [bgColorEnd, setBgColorEnd] = useState(profile.background_color_end || '#020617')

  const getLuminance = (hex: string) => {
    const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16) / 255) || [0, 0, 0]
    const [r, g, b] = rgb
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const textColor = (bgType === 'solid' ? getLuminance(bgColor) : getLuminance(bgColorEnd)) > 0.5 ? 'text-slate-900' : 'text-white'
  const btnBgClass = (bgType === 'solid' ? getLuminance(bgColor) : getLuminance(bgColorEnd)) > 0.5 ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-slate-100'
  const btnTextClass = (bgType === 'solid' ? getLuminance(bgColor) : getLuminance(bgColorEnd)) > 0.5 ? 'text-white' : 'text-slate-900'

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
      toast.success('Profile saved successfully!')
    } catch (error) {
      toast.error(`Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveBackground = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          background_type: bgType,
          background_color: bgColor,
          background_color_end: bgColorEnd,
        })
        .eq('id', profile.id)

      if (error) throw error

      onProfileUpdate({
        background_type: bgType,
        background_color: bgColor,
        background_color_end: bgColorEnd,
      })
      toast.success('Background updated!')
    } catch (error) {
      toast.error(`Error saving background: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB')
      return
    }
    setIsUploadingAvatar(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/avatar_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (dbError) throw dbError

      onProfileUpdate({ avatar_url: publicUrl })
      toast.success('Profile image uploaded!')
    } catch (error) {
      toast.error(`Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!profile.avatar_url) return
    setIsUploadingAvatar(true)

    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id)

      if (dbError) throw dbError

      onProfileUpdate({ avatar_url: null })
      toast.success('Profile image removed.')
    } catch (error) {
      toast.error(`Error removing image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleBackgroundUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB')
      return
    }
    setIsUploadingBg(true)

    try {
      if (profile.background_url) {
        const oldPath = profile.background_url.split('/backgrounds/')[1]
        if (oldPath) {
          await supabase.storage.from('backgrounds').remove([oldPath])
        }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/background_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ background_url: publicUrl, background_type: 'image' })
        .eq('id', profile.id)

      if (dbError) throw dbError

      setBgType('image')
      onProfileUpdate({ background_url: publicUrl, background_type: 'image' })
      toast.success('Profile background uploaded!')
    } catch (error) {
      toast.error(`Error uploading background: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploadingBg(false)
    }
  }

  const handleBackgroundDelete = async () => {
    setIsUploadingBg(true)

    try {
      if (profile.background_url) {
        const oldPath = profile.background_url.split('/backgrounds/')[1]
        if (oldPath) {
          await supabase.storage.from('backgrounds').remove([oldPath])
        }
      }

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ background_url: null, background_type: 'solid', background_color: '#020617', background_color_end: '#020617' })
        .eq('id', profile.id)

      if (dbError) throw dbError

      setBgType('solid')
      setBgColor('#020617')
      setBgColorEnd('#020617')
      onProfileUpdate({ background_url: null, background_type: 'solid', background_color: '#020617', background_color_end: '#020617' })
      toast.success('Background removed.')
    } catch (error) {
      toast.error(`Error removing background: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploadingBg(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Profile Image</h3>
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || 'Avatar'}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-semibold text-lg border-2 border-slate-700">
                {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase()}
              </div>
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#28af90] animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 bg-[#28af90] hover:bg-[#1e876e] text-white font-semibold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-colors duration-200">
              <Upload className="w-4 h-4" />
              <span>Upload photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </label>

            {profile.avatar_url && (
              <button
                type="button"
                onClick={handleAvatarDelete}
                disabled={isUploadingAvatar}
                className="flex items-center gap-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900 border border-slate-700 text-slate-350 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Profile Info</h3>
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Smith"
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={150}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-sm resize-none"
            />
            <p className="text-[10px] text-slate-500 text-right mt-1">
              {bio.length}/150 characters
            </p>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#28af90] hover:bg-[#1e876e] disabled:bg-[#28af90]/50 disabled:cursor-not-allowed text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save profile</span>
            </button>
          </div>
        </form>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-2">Profile Background</h3>
        <p className="text-xs text-slate-400 mb-5">
          Customize your public page background
        </p>

        <div className="mb-6 flex justify-center">
          <div
            className="w-full max-w-xs aspect-[9/16] rounded-2xl overflow-hidden relative"
            style={
              bgType === 'solid'
                ? { backgroundColor: bgColor }
                : bgType === 'gradient'
                  ? { background: `linear-gradient(to bottom, ${bgColor}, ${bgColorEnd})` }
                  : profile.background_url
                    ? {
                        backgroundImage: `url(${profile.background_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }
                    : { backgroundColor: '#020617' }
            }
          >
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${textColor}`}
              style={bgType === 'image' ? { backgroundColor: 'rgba(0,0,0,0.75)' } : {}}
            >
              <div className="w-10 h-10 rounded-full bg-slate-600 mb-2" />
              <span className="text-xs font-bold">@{profile.username}</span>
              <div className="mt-3 w-full space-y-2">
                <div className={`w-full h-8 ${btnBgClass} ${btnTextClass} rounded-full flex items-center justify-center text-[10px] font-bold`}>
                  Link 1
                </div>
                <div className={`w-full h-8 ${btnBgClass} ${btnTextClass} rounded-full flex items-center justify-center text-[10px] font-bold`}>
                  Link 2
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setBgType('solid')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
              bgType === 'solid' ? 'border-[#28af90] bg-[#28af90]/10' : 'border-slate-700 bg-slate-950 hover:border-slate-600'
            }`}
          >
            <Palette className={`w-6 h-6 ${bgType === 'solid' ? 'text-[#28af90]' : 'text-slate-400'}`} />
            <span className="text-xs font-semibold text-white">Solid</span>
          </button>

          <button
            type="button"
            onClick={() => setBgType('gradient')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
              bgType === 'gradient' ? 'border-[#28af90] bg-[#28af90]/10' : 'border-slate-700 bg-slate-950 hover:border-slate-600'
            }`}
          >
            <Share className={`w-6 h-6 ${bgType === 'gradient' ? 'text-[#28af90]' : 'text-slate-400'}`} />
            <span className="text-xs font-semibold text-white">Gradient</span>
          </button>

          <button
            type="button"
            onClick={() => setBgType('image')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
              bgType === 'image' ? 'border-[#28af90] bg-[#28af90]/10' : 'border-slate-700 bg-slate-950 hover:border-slate-600'
            }`}
          >
            <ImageIcon className={`w-6 h-6 ${bgType === 'image' ? 'text-[#28af90]' : 'text-slate-400'}`} />
            <span className="text-xs font-semibold text-white">Image</span>
          </button>
        </div>

        {bgType === 'solid' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => { setBgColor(e.target.value); setBgColorEnd(e.target.value) }}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white uppercase outline-none focus:border-[#28af90] text-sm font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {bgType === 'gradient' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Top Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white uppercase outline-none focus:border-[#28af90] text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Bottom Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColorEnd}
                  onChange={(e) => setBgColorEnd(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={bgColorEnd}
                  onChange={(e) => setBgColorEnd(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white uppercase outline-none focus:border-[#28af90] text-sm font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {bgType === 'image' && (
          <div className="space-y-4">
            {profile.background_url ? (
              <div className="relative rounded-xl overflow-hidden">
                <Image
                  src={profile.background_url}
                  alt="Current background"
                  width={400}
                  height={128}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Current background</span>
                </div>
              </div>
            ) : null}

            <div className="flex gap-3">
              <label className="flex items-center gap-2 bg-[#28af90] hover:bg-[#1e876e] text-white font-semibold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-colors duration-200 flex-1 justify-center">
                <Upload className="w-4 h-4" />
                <span>{profile.background_url ? 'Change background' : 'Upload background'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  disabled={isUploadingBg}
                  className="hidden"
                />
              </label>

              {profile.background_url && (
                <button
                  type="button"
                  onClick={handleBackgroundDelete}
                  disabled={isUploadingBg}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-slate-700 text-slate-350 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500">Max 2 MB. Recommended: 1080x1920px</p>
          </div>
        )}

        {(bgType === 'solid' || bgType === 'gradient') && (
          <div className="flex items-center justify-end pt-4 mt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSaveBackground}
              className="bg-[#28af90] hover:bg-[#1e876e] text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              {isUploadingBg && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save background</span>
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

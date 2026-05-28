'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { 
  Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, 
  Check, Loader2, Link2, AlertTriangle, Eye, EyeOff 
} from 'lucide-react'

interface LinkItem {
  id: string
  title: string
  url: string
  active: boolean
  sort_order: number
}

interface LinksManagerProps {
  userId: string
  links: LinkItem[]
  onLinksUpdate: (newLinks: LinkItem[]) => void
}

const linkSchema = z.object({
  title: z.string().min(1, { message: 'El título es obligatorio' }),
  url: z.string().min(1, { message: 'La URL o número de WhatsApp es obligatorio' }),
})

type LinkFormValues = z.infer<typeof linkSchema>

export default function LinksManager({ userId, links, onLinksUpdate }: LinksManagerProps) {
  const supabase = createClient()
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: '',
      url: '',
    },
  })

  // Formateador de URL inteligente (Soporta URLs tradicionales y teléfonos de WhatsApp)
  const formatUrlInput = (inputUrl: string): string => {
    const trimmed = inputUrl.trim()
    
    // Si contiene solo números, espacios, guiones o signos de más
    // y tiene longitud de un teléfono (8 a 15 dígitos)
    const digitsOnly = trimmed.replace(/[\s\-\+]/g, '')
    if (/^\d{8,15}$/.test(digitsOnly)) {
      return `https://wa.me/${digitsOnly}`
    }
    
    // Si no empieza con http:// o https://, agregarlo
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`
    }
    
    return trimmed
  }

  // Añadir un nuevo enlace
  const onAddLink = async (values: LinkFormValues) => {
    setIsLoading(true)
    try {
      const formattedUrl = formatUrlInput(values.url)
      
      const nextSortOrder = links.length > 0 
        ? Math.max(...links.map(l => l.sort_order)) + 1 
        : 0

      const { data, error } = await supabase
        .from('links')
        .insert({
          user_id: userId,
          title: values.title,
          url: formattedUrl,
          active: true,
          sort_order: nextSortOrder,
        })
        .select()
        .single()

      if (error) throw error

      onLinksUpdate([...links, data])
      reset()
      setIsAdding(false)
      toast.success('¡Enlace añadido con éxito!')
    } catch (error: any) {
      toast.error(`Error al añadir enlace: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar cambios al editar título/url
  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) return
    
    try {
      const formattedUrl = formatUrlInput(editUrl)

      const { error } = await supabase
        .from('links')
        .update({ title: editTitle, url: formattedUrl })
        .eq('id', id)

      if (error) throw error

      onLinksUpdate(
        links.map((link) =>
          link.id === id ? { ...link, title: editTitle, url: formattedUrl } : link
        )
      )
      setEditingId(null)
      toast.success('¡Enlace actualizado!')
    } catch (error: any) {
      toast.error(`Error al actualizar enlace: ${error.message}`)
    }
  }

  // Eliminar un enlace
  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase.from('links').delete().eq('id', id)
      if (error) throw error

      onLinksUpdate(links.filter((link) => link.id !== id))
      toast.success('Enlace eliminado')
    } catch (error: any) {
      toast.error(`Error al eliminar enlace: ${error.message}`)
    }
  }

  // Activar / Desactivar enlace
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus
    
    // Optimización local instantánea
    onLinksUpdate(
      links.map((link) => (link.id === id ? { ...link, active: nextStatus } : link))
    )

    try {
      const { error } = await supabase
        .from('links')
        .update({ active: nextStatus })
        .eq('id', id)

      if (error) {
        // Revertir en caso de error
        onLinksUpdate(
          links.map((link) => (link.id === id ? { ...link, active: currentStatus } : link))
        )
        throw error
      }
    } catch (error: any) {
      toast.error(`Error al cambiar estado del enlace: ${error.message}`)
    }
  }

  // Reordenar Enlaces (Subir o Bajar)
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= links.length) return

    const newLinks = [...links]
    
    // Intercambiar posiciones en el array local
    const temp = newLinks[index]
    newLinks[index] = newLinks[targetIndex]
    newLinks[targetIndex] = temp

    // Reasignar los valores de sort_order basados en el nuevo índice
    const updatedLinks = newLinks.map((link, idx) => ({
      ...link,
      sort_order: idx,
    }))

    // Guardar estado local
    onLinksUpdate(updatedLinks)

    try {
      // Guardar en la base de datos para ambos registros
      const updatePromises = updatedLinks.map((link) =>
        supabase.from('links').update({ sort_order: link.sort_order }).eq('id', link.id)
      )
      
      const results = await Promise.all(updatePromises)
      const error = results.find((r) => r.error)
      if (error) throw error.error
    } catch (error: any) {
      toast.error(`Error al guardar el orden: ${error.message}`)
    }
  }

  const startEditing = (link: LinkItem) => {
    setEditingId(link.id)
    setEditTitle(link.title)
    setEditUrl(link.url)
  }

  return (
    <div className="space-y-6">
      {/* Encabezado e Interfaz para Añadir */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Tus Enlaces</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 bg-[#28af90] hover:bg-[#1e876e] text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir enlace</span>
        </button>
      </div>

      {/* Formulario de Añadir Enlace */}
      {isAdding && (
        <form
          onSubmit={handleSubmit(onAddLink)}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 animate-fade-in"
        >
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-[#28af90]" /> Nuevo Enlace
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Título del botón
              </label>
              <input
                type="text"
                placeholder="Ej. Mi Canal de YouTube"
                {...register('title')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] text-xs transition-all"
              />
              {errors.title && (
                <p className="text-[10px] text-red-400 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Dirección URL o Teléfono de WhatsApp
              </label>
              <input
                type="text"
                placeholder="Ej. https://youtube.com/c/nombre o 573167195500"
                {...register('url')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] text-xs transition-all"
              />
              {errors.url && (
                <p className="text-[10px] text-red-400 mt-1">{errors.url.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-2 bg-slate-850 hover:bg-slate-800 text-slate-350 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1 bg-[#28af90] hover:bg-[#1e876e] disabled:bg-[#28af90]/50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              {isLoading && <Loader2 className="w-3 animate-spin" />}
              <span>Agregar</span>
            </button>
          </div>
        </form>
      )}

      {/* Lista de Enlaces */}
      <div className="space-y-3.5">
        {links.length > 0 ? (
          links.map((link, idx) => {
            const isEditing = editingId === link.id
            return (
              <div
                key={link.id}
                className={`bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex gap-4 transition-all duration-200 ${
                  !link.active && 'opacity-65'
                }`}
              >
                {/* Controles de Reordenación */}
                <div className="flex flex-col justify-center gap-1.5">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-slate-850 text-slate-400 disabled:opacity-20 hover:text-white rounded-md transition-colors cursor-pointer"
                    title="Subir"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === links.length - 1}
                    className="p-1 hover:bg-slate-850 text-slate-400 disabled:opacity-20 hover:text-white rounded-md transition-colors cursor-pointer"
                    title="Bajar"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Contenido del Enlace */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Título"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs outline-none focus:border-[#28af90]"
                      />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="URL o Teléfono"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs outline-none focus:border-[#28af90]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(link.id)}
                          className="bg-[#28af90] hover:bg-[#1e876e] text-white font-semibold text-[10px] py-1.5 px-3 rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-[10px] py-1.5 px-3 rounded-md cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-bold text-white text-sm truncate">
                          {link.title}
                        </h4>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#28af90] hover:underline flex items-center gap-1 mt-0.5 truncate max-w-max"
                        >
                          <span>{link.url}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </a>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => startEditing(link)}
                          className="text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
                        >
                          Editar
                        </button>
                        <span className="text-slate-850">|</span>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="text-slate-400 hover:text-red-400 text-xs transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Switch de Activación */}
                <div className="flex items-center self-start md:self-center">
                  <button
                    onClick={() => handleToggleActive(link.id, link.active)}
                    className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                      link.active
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-slate-800/60 border-slate-700 text-slate-550 hover:bg-slate-800 hover:text-slate-400'
                    }`}
                    title={link.active ? 'Desactivar enlace' : 'Activar enlace'}
                  >
                    {link.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500 animate-fade-in">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold">No tienes enlaces registrados</p>
            <p className="text-xs mt-1">
              Agrega tu primer enlace usando el botón superior "Añadir enlace".
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

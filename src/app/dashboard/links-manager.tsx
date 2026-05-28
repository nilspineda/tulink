'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  Plus, Trash2, ArrowUp, ArrowDown, ExternalLink,
  Check, Loader2, Link2, AlertTriangle, Eye, EyeOff,
  GripVertical
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

interface SortableLinkProps {
  link: LinkItem
  index: number
  editingId: string | null
  editTitle: string
  editUrl: string
  links: LinkItem[]
  onStartEditing: (link: LinkItem) => void
  onSaveEdit: (id: string) => void
  onDeleteLink: (id: string) => void
  onToggleActive: (id: string, currentStatus: boolean) => void
  onMove: (index: number, direction: 'up' | 'down') => void
  onEditTitleChange: (value: string) => void
  onEditUrlChange: (value: string) => void
}

function SortableLink({
  link,
  index,
  editingId,
  editTitle,
  editUrl,
  links,
  onStartEditing,
  onSaveEdit,
  onDeleteLink,
  onToggleActive,
  onMove,
  onEditTitleChange,
  onEditUrlChange,
}: SortableLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const isEditing = editingId === link.id

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex gap-3 transition-all duration-200 ${
        !link.active && 'opacity-65'
      } ${isDragging ? 'shadow-2xl ring-2 ring-[#28af90]' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex flex-col justify-center gap-1">
        <button
          onClick={() => onMove(index, 'up')}
          disabled={index === 0}
          className="p-1 hover:bg-slate-850 text-slate-400 disabled:opacity-20 hover:text-white rounded-md transition-colors cursor-pointer"
          title="Subir"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => onMove(index, 'down')}
          disabled={index === links.length - 1}
          className="p-1 hover:bg-slate-850 text-slate-400 disabled:opacity-20 hover:text-white rounded-md transition-colors cursor-pointer"
          title="Bajar"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2.5">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              placeholder="Título"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs outline-none focus:border-[#28af90]"
            />
            <input
              type="text"
              value={editUrl}
              onChange={(e) => onEditUrlChange(e.target.value)}
              placeholder="URL o Teléfono"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs outline-none focus:border-[#28af90]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => onSaveEdit(link.id)}
                className="bg-[#28af90] hover:bg-[#1e876e] text-white font-semibold text-[10px] py-1.5 px-3 rounded-md flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" /> Guardar
              </button>
              <button
                onClick={() => onStartEditing(null as any)}
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
                onClick={() => onStartEditing(link)}
                className="text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
              >
                Editar
              </button>
              <span className="text-slate-850">|</span>
              <button
                onClick={() => onDeleteLink(link.id)}
                className="text-slate-400 hover:text-red-400 text-xs transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center self-start md:self-center">
        <button
          onClick={() => onToggleActive(link.id, link.active)}
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
}

export default function LinksManager({ userId, links, onLinksUpdate }: LinksManagerProps) {
  const supabase = createClient()
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const formatUrlInput = (inputUrl: string): string => {
    const trimmed = inputUrl.trim()
    const digitsOnly = trimmed.replace(/[\s\-\+]/g, '')
    if (/^\d{8,15}$/.test(digitsOnly)) {
      return `https://wa.me/${digitsOnly}`
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`
    }
    return trimmed
  }

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

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus

    onLinksUpdate(
      links.map((link) => (link.id === id ? { ...link, active: nextStatus } : link))
    )

    try {
      const { error } = await supabase
        .from('links')
        .update({ active: nextStatus })
        .eq('id', id)

      if (error) {
        onLinksUpdate(
          links.map((link) => (link.id === id ? { ...link, active: currentStatus } : link))
        )
        throw error
      }
    } catch (error: any) {
      toast.error(`Error al cambiar estado del enlace: ${error.message}`)
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= links.length) return

    const newLinks = [...links]
    const temp = newLinks[index]
    newLinks[index] = newLinks[targetIndex]
    newLinks[targetIndex] = temp

    const updatedLinks = newLinks.map((link, idx) => ({
      ...link,
      sort_order: idx,
    }))

    onLinksUpdate(updatedLinks)

    try {
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const oldIndex = links.findIndex((l) => l.id === active.id)
    const newIndex = links.findIndex((l) => l.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newLinks = arrayMove(links, oldIndex, newIndex)
    const updatedLinks = newLinks.map((link, idx) => ({
      ...link,
      sort_order: idx,
    }))

    onLinksUpdate(updatedLinks)

    try {
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

  const activeLink = activeId ? links.find((l) => l.id === activeId) : null

  return (
    <div className="space-y-6">
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3.5">
            {links.length > 0 ? (
              links.map((link, idx) => (
                <SortableLink
                  key={link.id}
                  link={link}
                  index={idx}
                  editingId={editingId}
                  editTitle={editTitle}
                  editUrl={editUrl}
                  links={links}
                  onStartEditing={startEditing}
                  onSaveEdit={handleSaveEdit}
                  onDeleteLink={handleDeleteLink}
                  onToggleActive={handleToggleActive}
                  onMove={handleMove}
                  onEditTitleChange={setEditTitle}
                  onEditUrlChange={setEditUrl}
                />
              ))
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
        </SortableContext>

        <DragOverlay>
          {activeLink ? (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex gap-3 shadow-2xl ring-2 ring-[#28af90]">
              <div className="flex items-center justify-center text-slate-400">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{activeLink.title}</h4>
                <span className="text-xs text-[#28af90] truncate">{activeLink.url}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
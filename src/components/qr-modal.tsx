'use client'

import { useState, useRef, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Download, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface QRModalProps {
  username: string
  origin: string
  isOpen: boolean
  onClose: () => void
}

export default function QRModal({ username, origin, isOpen, onClose }: QRModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const profileUrl = `${origin}/${username}`

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const svg = qrRef.current?.querySelector('svg')
      if (!svg) throw new Error('QR not found')

      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        canvas.width = 400
        canvas.height = 400
        ctx?.drawImage(img, 0, 0, 400, 400)
        URL.revokeObjectURL(url)

        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a')
            link.download = `tuLink-QR-${username}.png`
            link.href = URL.createObjectURL(blob)
            link.click()
            URL.revokeObjectURL(link.href)
            toast.success('¡QR descargado!')
          }
          setIsDownloading(false)
        }, 'image/png')
      }

      img.src = url
    } catch {
      toast.error('Error al descargar QR')
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Mi TuLink',
          text: `Escanea mi QR para ver mi perfil: ${profileUrl}`,
          url: profileUrl,
        })
      } else {
        await navigator.clipboard.writeText(profileUrl)
        toast.success('¡Enlace copiado!')
      }
    } catch {
      toast.error('Error al compartir')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-2">Código QR de tu perfil</h3>
        <p className="text-xs text-slate-400 mb-6">{profileUrl}</p>

        <div ref={qrRef} className="flex justify-center bg-white p-6 rounded-xl mb-6">
          <QRCodeSVG
            value={profileUrl}
            size={220}
            level="H"
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#28af90] hover:bg-[#1e876e] disabled:bg-[#28af90]/50 text-white font-semibold text-xs py-3 rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Descargando...' : 'Descargar PNG'}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
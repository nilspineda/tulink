import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'tulink by Nilspineda | Comparte tus enlaces',
  description: 'Administra y comparte todos tus enlaces importantes en una sola página con tulink.dev.',
  keywords: ['enlaces', 'perfil', 'redes sociales', 'portafolio'],
  authors: [{ name: 'Nilspineda' }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'tulink',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#28af90',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
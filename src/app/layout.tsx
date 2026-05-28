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
  metadataBase: new URL('https://www.tulink.dev'),
  title: {
    default: 'tulink by Nilspineda | Comparte tus enlaces',
    template: '%s | tulink'
  },
  description: 'Administra y comparte todos tus enlaces importantes en una sola página con tulink.dev. Tu bio link premium totalmente personalizable.',
  keywords: ['enlaces', 'perfil', 'redes sociales', 'portafolio', 'bio link', 'linktree', 'supabase', 'vercel'],
  authors: [{ name: 'Nilspineda', url: 'https://nilspineda.com' }],
  creator: 'Nilspineda',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://www.tulink.dev',
    siteName: 'tulink',
    title: 'tulink by Nilspineda | Comparte tus enlaces',
    description: 'Administra y comparte todos tus enlaces importantes en una sola página con tulink.dev. Tu bio link premium totalmente personalizable.',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'tulink logo',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'tulink by Nilspineda | Comparte tus enlaces',
    description: 'Administra y comparte todos tus enlaces importantes en una sola página con tulink.dev.',
    images: ['/logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
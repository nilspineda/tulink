import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import './globals.css'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-MNHKB37P'

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
      { url: '/favicon.jpg', sizes: 'any' }
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
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="es" className={`${dmSans.variable} antialiased`}>
      <head>
        <Script id="gtm-script" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  )
}
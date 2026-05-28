import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Smartphone, Shield, Sparkles, Link2 } from 'lucide-react'
import PartnerCarousel from '../components/partner-carousel'

export const metadata = {
  title: 'tulink - Tu Página de Enlaces Personalizada',
  description: 'Crea tu página de enlaces personalizada en segundos. Comparte tus perfiles sociales, portafolios y proyectos con un diseño elegante y responsive.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Luces de Fondo (Gradientes) - ocultos en móvil */}
      <div className="hidden sm:block absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#28af90]/10 blur-[120px] pointer-events-none"></div>
      <div className="hidden sm:block absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#28af90]/5 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="tulink logo"
              width={140}
              height={45}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-350 hover:text-white transition-colors py-2 px-3 sm:py-2.5 sm:px-3.5"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95 min-h-[44px] flex items-center"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 sm:py-20 relative z-10 w-full max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-[#28af90]/10 border border-[#28af90]/25 text-[#28af90] font-bold text-[11px] px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plataforma 100% Personalizable</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight px-2">
          Todo tu contenido.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#28af90] via-teal-400 to-emerald-300">
            En un solo enlace.
          </span>
        </h1>

        <p className="text-slate-400 mt-6 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed px-4">
          Crea una página de enlaces elegante en menos de un minuto. Comparte tus perfiles de redes sociales, portafolios, tiendas o proyectos con un diseño responsive premium y temas personalizables.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 bg-[#28af90] hover:bg-[#1e876e] text-white font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-200 shadow-lg shadow-[#28af90]/30 active:scale-98 cursor-pointer min-h-[52px] w-full sm:w-auto"
          >
            <span className="text-sm sm:text-base">Crear mi tulink</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-200 min-h-[52px] w-full sm:w-auto"
          >
            <span className="text-sm sm:text-base">Administrar mi cuenta</span>
          </Link>
        </div>

        {/* Feature Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-20 sm:mt-24 w-full px-4 sm:px-0 text-left">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
            <div className="p-2.5 sm:p-3 bg-[#28af90]/10 border border-[#28af90]/20 text-[#28af90] rounded-xl w-max mb-4">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold text-white text-base sm:text-lg">Diseño Mobile-First</h3>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm leading-relaxed">
              Tus seguidores disfrutarán de una experiencia premium adaptada a cualquier pantalla de smartphone.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
            <div className="p-2.5 sm:p-3 bg-[#28af90]/10 border border-[#28af90]/20 text-[#28af90] rounded-xl w-max mb-4">
              <Link2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold text-white text-base sm:text-lg">Gestión Simple</h3>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm leading-relaxed">
              Agrega, edita, ordena y desactiva tus enlaces en tiempo real desde tu panel administrativo intuitivo.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <div className="p-2.5 sm:p-3 bg-[#28af90]/10 border border-[#28af90]/20 text-[#28af90] rounded-xl w-max mb-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-bold text-white text-base sm:text-lg">Autenticación Segura</h3>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm leading-relaxed">
              Protegido mediante Supabase Auth y Row Level Security (RLS), asegurando que sólo tú edites tu contenido.
            </p>
          </div>
        </section>
      </main>

      <section className="bg-slate-900/40 backdrop-blur-md py-16 sm:py-20 mt-20 sm:mt-24 w-full px-4 sm:px-0 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">¿Listo para transformar tu presencia online?</h2>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-[#28af90] hover:bg-[#1e876e] text-white font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-200 shadow-lg shadow-[#28af90]/30 active:scale-98 cursor-pointer"
        >
          <span className="text-sm sm:text-base">Crear mi tulink</span>
          <ArrowRight className="w-5 h-5" />
        </Link>

         {/* Sección de Patrocinadores o Colaboradores */}
         <div className="mt-12">
          <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-4">Colaboradores Destacados</h3>
          <div className="flex items-center justify-center gap-8">
            <a href="https://nilspineda.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity duration-200"> <img src="nilspineda.svg"  alt="nilspineda.com" className="h-12 sm:h-8" />
             
            </a>
            
          </div>
        </div>
        
     
        <PartnerCarousel />
      </section>
      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 sm:py-8 bg-slate-950/60 mt-auto text-center z-10 text-xs text-white px-4">
        <p className="font-semibold uppercase tracking-wider mb-2">
          © {new Date().getFullYear()} tulink.dev
        </p>
        <p className="mt-1">
          <a href="https://nilspineda.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400">nilspineda.com</a>
          {' | '}
          WhatsApp: <a href="https://wa.me/573167195500" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400">+57 316 7195500</a>
        </p>
      </footer>
    </div>
  )
}
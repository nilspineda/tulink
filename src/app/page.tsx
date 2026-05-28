import Link from 'next/link'
import { ArrowRight, Smartphone, Shield, Sparkles, Link2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Luces de Fondo (Gradientes) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#28af90]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#28af90]/5 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#28af90] to-[#1e876e] flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-[#28af90]/20">
              t
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-baseline">
              <span className="text-[#28af90]">tu</span>link
              <span className="text-[10px] text-slate-400 font-normal ml-1.5">by Nilspineda</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-350 hover:text-white transition-colors py-2 px-3.5"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-95"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-[#28af90]/10 border border-[#28af90]/25 text-[#28af90] font-bold text-[11px] px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plataforma 100% Personalizable - tulink.dev</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Todo tu contenido.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#28af90] via-teal-400 to-emerald-300">
            En un solo enlace.
          </span>
        </h1>

        <p className="text-slate-400 mt-6 text-base sm:text-lg max-w-2xl leading-relaxed">
          Crea una página de enlaces elegante en menos de un minuto. Comparte tus perfiles de redes sociales, portafolios, tiendas o proyectos con un diseño responsive premium y temas personalizables.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 bg-[#28af90] hover:bg-[#1e876e] text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-[#28af90]/30 active:scale-98 cursor-pointer"
          >
            <span>Crear mi tulink</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold py-3.5 px-8 rounded-xl transition-all duration-200"
          >
            <span>Administrar mi cuenta</span>
          </Link>
        </div>

        {/* Feature Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24 w-full text-left">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="p-3 bg-[#28af90]/10 border border-[#28af90]/20 text-[#28af90] rounded-xl w-max mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Diseño Mobile-First</h3>
            <p className="text-slate-400 mt-2 text-xs leading-relaxed">
              Tus seguidores disfrutarán de una experiencia premium adaptada a cualquier pantalla de smartphone.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="p-3 bg-[#28af90]/10 border border-[#28af90]/20 text-[#28af90] rounded-xl w-max mb-4">
              <Link2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Gestión Simple</h3>
            <p className="text-slate-400 mt-2 text-xs leading-relaxed">
              Agrega, edita, ordena y desactiva tus enlaces en tiempo real desde tu panel administrativo intuitivo.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="p-3 bg-[#28af90]/10 border border-[#28af90]/20 text-[#28af90] rounded-xl w-max mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Autenticación Segura</h3>
            <p className="text-slate-400 mt-2 text-xs leading-relaxed">
              Protegido mediante Supabase Auth y Row Level Security (RLS), asegurando que sólo tú edites tu contenido.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950/60 mt-auto text-center z-10 text-xs text-slate-500">
        <p className="font-semibold uppercase tracking-wider mb-2">
          © {new Date().getFullYear()} tulink.dev. Todos los derechos reservados.
        </p>
        <p className="mt-1">
          <a href="https://nilspineda.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400">nilspineda.com</a> |
          WhatsApp: <a href="https://wa.me/573167195500" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400"> +57 316 7195500</a>
        </p>
      </footer>
    </div>
  )
}

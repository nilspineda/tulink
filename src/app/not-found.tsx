import Link from 'next/link'
import { ArrowLeft, Ghost } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        {/* Icono animado */}
        <div className="inline-flex p-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 animate-bounce">
          <Ghost className="w-12 h-12" />
        </div>

        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-200 mt-2">
          Perfil no encontrado
        </h2>
        <p className="text-slate-400 mt-3 text-sm max-w-xs mx-auto">
          El enlace que estás buscando no existe o el nombre de usuario fue modificado.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/login"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-650/20 active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </main>
  )
}

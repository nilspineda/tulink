'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { KeyRound, Mail, Loader2, ArrowRight } from 'lucide-react'
import Image from 'next/image'

const loginSchema = z.object({
  email: z.string().email({ message: 'Ingresa un correo electrónico válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const isRegistered = searchParams.get('registered')

  useEffect(() => {
    if (isRegistered) {
      const t = setTimeout(() => {
        toast.success('¡Cuenta creada con éxito! Ingresa tus datos para iniciar sesión.')
      }, 300)
      return () => clearTimeout(t)
    }
  }, [isRegistered])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        throw new Error(error.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
          : error.message
        )
      }

      toast.success('¡Inicio de sesión exitoso!')
      router.refresh()
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión')
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:border-slate-800/80 w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
        Iniciar Sesión
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              placeholder="tu@correo.com"
              {...register('email')}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-base min-h-[48px]"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#28af90] hover:text-[#1e876e] font-semibold transition-colors duration-200"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-base min-h-[48px]"
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#28af90] hover:bg-[#1e876e] disabled:bg-[#28af90]/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#28af90]/25 active:scale-[0.98] cursor-pointer min-h-[52px] text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Ingresando...</span>
            </>
          ) : (
            <>
              <span>Ingresar</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-slate-400 text-sm sm:text-base">
          ¿No tienes una cuenta?{' '}
          <Link
            href="/register"
            className="text-[#28af90] hover:text-[#1e876e] font-semibold transition-colors duration-200"
          >
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md my-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.svg"
              alt="tulink logo"
              width={180}
              height={60}
              priority
              className="h-10 w-auto"
            />
          </div>
          <p className="text-slate-400 mt-2 text-sm">
            Administra tu marca personal en un solo enlace
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-[#28af90] animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      <footer className="mt-auto py-6 text-center text-xs text-slate-500 border-t border-slate-900 w-full max-w-md px-4">
        <p>
          Nilspineda (<a href="https://nilspineda.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400">nilspineda.com</a>)
        </p>
        <p className="mt-1">
          WhatsApp: <a href="https://wa.me/573167195500" target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-400">+57 316 7195500</a>
        </p>
      </footer>
    </main>
  )
}
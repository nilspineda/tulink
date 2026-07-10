'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { KeyRound, Mail, User, Tag, Loader2, ArrowRight } from 'lucide-react'
import Image from 'next/image'

const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
    .max(20, { message: 'El nombre de usuario no puede exceder 20 caracteres' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Solo se permiten letras, números y guión bajo (_)',
    }),
  fullName: z.string().min(2, { message: 'El nombre completo debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Ingresa un correo electrónico válido' }),
  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Debe incluir mayúscula, minúscula y número',
    }),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true)

    try {
      const { data: profileCheck, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', values.username.toLowerCase())
        .maybeSingle()

      if (checkError) {
        throw new Error(`Error al validar nombre de usuario: ${checkError.message}`)
      }

      if (profileCheck) {
        throw new Error('El nombre de usuario ya está registrado')
      }

      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username.toLowerCase(),
            full_name: values.fullName,
          },
        },
      })

      if (error) throw error

      toast.success('¡Registro exitoso! Por favor inicia sesión con tus credenciales.')

      setTimeout(() => {
        router.push('/login?registered=true')
      }, 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error inesperado al registrarte')
      setIsLoading(false)
    }
  }

  return (
    <main className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 px-4 overflow-hidden">
      <div className="w-full max-w-md flex flex-col items-center justify-center flex-1 py-8">
        <div className="text-center mb-6 shrink-0">
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
            Crea tu perfil y comparte todos tus enlaces
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
            Crear Cuenta
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Nombre de Usuario
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="mi_usuario"
                  {...register('username')}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-base min-h-[48px]"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-400 mt-1.5">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  {...register('fullName')}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-base min-h-[48px]"
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-400 mt-1.5">{errors.fullName.message}</p>
              )}
            </div>

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
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-base min-h-[48px]"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-650 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-base min-h-[48px]"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#28af90] hover:bg-[#1e876e] disabled:bg-[#28af90]/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#28af90]/25 active:scale-[0.98] mt-2 cursor-pointer min-h-[52px] text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Registrarme</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm sm:text-base">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="text-[#28af90] hover:text-[#1e876e] font-semibold transition-colors duration-200"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-6 text-center text-xs text-slate-500 shrink-0">
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
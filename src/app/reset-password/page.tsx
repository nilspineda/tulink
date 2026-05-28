'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { KeyRound, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: z.string().min(6, { message: 'La confirmación debe tener al menos 6 caracteres' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        throw new Error(error.message)
      }

      toast.success('¡Contraseña restablecida con éxito!')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message || 'Error al restablecer la contraseña')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md my-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline justify-center gap-1">
            <span className="text-[#28af90]">tu</span>link
            <span className="text-[10px] text-slate-400 font-normal ml-1">by Nilspineda</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Restablece la contraseña de tu cuenta
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:border-slate-800/80 w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
            Establecer Nueva Contraseña
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider mb-2">
                Nueva Contraseña
              </label>
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

            <div>
              <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-[#28af90] focus:ring-1 focus:ring-[#28af90] transition-all duration-200 text-base min-h-[48px]"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1.5">{errors.confirmPassword.message}</p>
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
                  <span>Restableciendo contraseña...</span>
                </>
              ) : (
                <>
                  <span>Restablecer contraseña</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al inicio de sesión</span>
              </Link>
            </div>
          </form>
        </div>
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

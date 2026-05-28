'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Mail, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Ingresa un correo electrónico válido' }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true)

    try {
      const redirectTo = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo,
      })

      if (error) {
        throw new Error(error.message)
      }

      toast.success('¡Enlace de recuperación enviado!')
      setIsSent(true)
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar el enlace de recuperación')
    } finally {
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
            Recupera el acceso a tu cuenta
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:border-slate-800/80 w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">
            Recuperar Contraseña
          </h2>

          {isSent ? (
            <div className="text-center space-y-5">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#28af90]/10 flex items-center justify-center text-[#28af90]">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada o carpeta de spam.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[#28af90] hover:text-[#1e876e] font-semibold transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al inicio de sesión</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <p className="text-slate-400 text-sm text-center mb-2 leading-relaxed">
                Ingresa tu dirección de correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.
              </p>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#28af90] hover:bg-[#1e876e] disabled:bg-[#28af90]/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#28af90]/25 active:scale-[0.98] cursor-pointer min-h-[52px] text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando enlace...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar enlace de recuperación</span>
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
          )}
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

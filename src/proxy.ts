import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ipRequestMap = new Map<string, { count: number; resetTime: number }>()

function getIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) {
    return xRealIp
  }
  return '127.0.0.1'
}

export async function proxy(request: NextRequest) {
  const ip = getIp(request)
  const now = Date.now()
  const limit = 60 // 60 solicitudes por minuto
  const windowMs = 60000

  let record = ipRequestMap.get(ip)

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    }
    ipRequestMap.set(ip, record)
  } else {
    record.count++
  }

  // Limpieza perezosa (lazy) de memoria (5% de probabilidad por solicitud)
  if (Math.random() < 0.05) {
    for (const [key, val] of ipRequestMap.entries()) {
      if (now > val.resetTime) {
        ipRequestMap.delete(key)
      }
    }
  }

  const remaining = Math.max(0, limit - record.count)
  const reset = Math.ceil((record.resetTime - now) / 1000)

  if (record.count > limit) {
    return new NextResponse('Demasiadas peticiones. Por favor, intenta de nuevo más tarde.', {
      status: 429,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
      },
    })
  }

  const response = await updateSession(request)
  response.headers.set('X-RateLimit-Limit', String(limit))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(reset))

  return response
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     * - imágenes públicas (por ejemplo, svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

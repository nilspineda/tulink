interface SupabaseErrorLike {
  message?: string
  code?: string
  details?: string
  hint?: string
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message

  if (typeof error === 'object') {
    const e = error as SupabaseErrorLike
    const parts = [
      e.message,
      e.code ? `[${e.code}]` : null,
      e.details ? `— ${e.details}` : null,
      e.hint ? `(${e.hint})` : null,
    ].filter(Boolean)

    if (parts.length > 0) return parts.join(' ')
  }

  return 'Unknown error'
}

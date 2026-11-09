'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

function getClientSnapshot(): string {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

function getServerSnapshot(): string {
  return ''
}

/**
 * Devuelve el origin real del navegador sin provocar desajustes de
 * hidratación: durante la hidratación usa el snapshot del servidor ('') y
 * solo después de monta aplica el valor real.
 */
export function useBrowserOrigin(): string {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}

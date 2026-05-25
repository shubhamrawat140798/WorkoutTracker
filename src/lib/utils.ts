import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date + (date.length === 10 ? 'T00:00:00' : '')) : date
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatVolume(volume: number, unit: string) {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k ${unit}`
  return `${Math.round(volume)} ${unit}`
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

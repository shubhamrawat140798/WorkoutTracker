import type { User } from '@/lib/api'

export function isAdmin(user: User | null | undefined) {
  if (!user) return false
  return user.role === 'admin'
}

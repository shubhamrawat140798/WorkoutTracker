import { defineHandler } from 'nitro'
import { clearSessionCookie } from '../lib/auth'

export default defineHandler((event) => {
  clearSessionCookie(event)
  return { success: true }
})

import type { users } from './lib/schema'

declare module 'h3' {
  interface H3EventContext {
    user?: {
      id: string
      email: string
      name: string
      createdAt: Date
    }
  }
}

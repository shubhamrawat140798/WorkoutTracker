import { definePlugin } from 'nitro'
import { loadServerEnv } from '../routes/api/lib/env'

export default definePlugin(() => {
  loadServerEnv()
})

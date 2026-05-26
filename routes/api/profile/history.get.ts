import { defineHandler } from 'nitro'
import { requireAuth } from '../lib/auth'
import { listProfileSnapshots } from '../lib/profile'

export default defineHandler(async (event) => {
  const user = await requireAuth(event)
  const snapshots = await listProfileSnapshots(user.id)
  return { snapshots }
})

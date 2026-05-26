import { defineHandler } from 'nitro'
import { requireAdmin } from '../../lib/auth'
import { listCatalog } from '../../lib/catalog'
import { handleDbError } from '../../lib/errors'

export default defineHandler(async (event) => {
  await requireAdmin(event)
  try {
    const exercises = await listCatalog(false)
    return { exercises }
  } catch (error) {
    handleDbError(error)
  }
})

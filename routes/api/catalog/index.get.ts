import { defineHandler } from 'nitro'
import { listCatalog } from '../lib/catalog'
import { handleDbError } from '../lib/errors'

export default defineHandler(async () => {
  try {
    const exercises = await listCatalog(true)
    return { exercises }
  } catch (error) {
    handleDbError(error)
  }
})

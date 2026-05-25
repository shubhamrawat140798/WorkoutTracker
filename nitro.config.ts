import { defineConfig } from 'nitro/config'

export default defineConfig({
  serverDir: './',
  preset: process.env.VERCEL ? 'vercel' : 'node-server',
})

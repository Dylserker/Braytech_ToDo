import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const certificateDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '../back/certs')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: readFileSync(resolve(certificateDirectory, 'localhost-key.pem')),
      cert: readFileSync(resolve(certificateDirectory, 'localhost.pem')),
    },
  },
})

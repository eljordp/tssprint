import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { cpSync, mkdirSync, readFileSync } from 'node:fs'

const pdfRoot = path.resolve(__dirname, 'node_modules/pdfjs-dist')
const pdfVersion = JSON.parse(readFileSync(path.join(pdfRoot, 'package.json'), 'utf8')).version
for (const folder of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
  const target = path.resolve(__dirname, 'public/pdfjs', pdfVersion, folder)
  mkdirSync(target, { recursive: true })
  cpSync(path.join(pdfRoot, folder), target, { recursive: true })
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

/**
 * Çıktı, çift tıklayınca açılabilen TEK bir HTML dosyası olacak şekilde üretilir:
 * JS, CSS ve fontlar dosyanın içine gömülür, böylece sunucuya gerek kalmaz.
 * (Tarayıcılar file:// üzerinden harici modül/asset yüklemeyi engelliyor.)
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    assetsInlineLimit: 100 * 1024 * 1024,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 4096,
  },
  server: { port: 5173, open: true },
})

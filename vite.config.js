import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Netlify 및 GitHub Pages 배포 경로 호환
  plugins: [react()],
  server: {
    host: true, // 0.0.0.0 바인딩 (localhost, 127.0.0.1 모두 접근 허용)
    port: 5173,
  },
})

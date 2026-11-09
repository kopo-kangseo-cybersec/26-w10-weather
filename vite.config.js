import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Netlify에서는 루트('/'), GitHub Pages에서는 저장소 서브경로('/26-w10-weather/')로 배포
  base: process.env.NETLIFY ? '/' : '/26-w10-weather/',
  plugins: [react()],
})

console.log('✅ vite.config.js 已被加载，端口设置为：8081');
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: 'localhost',
    port: 8082,          // 强制指定前端端口
    strictPort: true,    // 端口被占用时直接报错，不自动切 5173
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 代理到后端 8080
        changeOrigin: true,
      }
    }
  }
})
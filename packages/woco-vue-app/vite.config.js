import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import woco from 'woco-vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),woco({
    virtualFileId:'@my-virtual-file'
  })]
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  resolve:{
    extensions: [".tsx", ".ts", ".js"],
    alias:{
      '@' : path.resolve(__dirname, './src')
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [react()]
})

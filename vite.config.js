import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'), // Points to the file we created in Phase 1
      name: 'PlanetLibrary', // The global variable name (for UMD builds)
      fileName: 'index',     // The output file name
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled into your library
      external: ['react', 'react-dom', 'three', 'react-router-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          three: 'THREE',
          'react-router-dom': 'ReactRouterDOM'
        },
      },
    },
  },
})
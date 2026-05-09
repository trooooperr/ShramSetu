import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/signup_user': {
        target: 'http://localhost:3000',
        bypass: (req) => {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            return req.url;
          }
        }
      },
      '/signup_worker': {
        target: 'http://localhost:3000',
        bypass: (req) => {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            return req.url;
          }
        }
      },
      '/login_user': {
        target: 'http://localhost:3000',
        bypass: (req) => {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            return req.url;
          }
        }
      },
      '/login_worker': {
        target: 'http://localhost:3000',
        bypass: (req) => {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            return req.url;
          }
        }
      },
      '/uploadprofile': 'http://localhost:3000',
      '/uploadproblem': 'http://localhost:3000',
      '/send-email': 'http://localhost:3000',
      '/logout': 'http://localhost:3000',
      '/mylocation': 'http://localhost:3000'
    }
  }

})

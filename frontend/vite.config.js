import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // VITE_BASE_PATH cho phép build deploy dưới một sub-path (vd: GitHub Pages
  // project site tại /<repo>/) mà không ảnh hưởng tới `npm run dev` hay các
  // lần build mặc định khác (không set biến này thì base vẫn là '/').
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
});

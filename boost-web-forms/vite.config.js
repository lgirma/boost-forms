const path = require('path')
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import svelte from '@sveltejs/vite-plugin-svelte'


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [reactRefresh(), svelte()],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'boost-web-forms'
        },
        rollupOptions: {

        }
    }
})
/*
module.exports = {
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'boost-web-forms'
        },
        rollupOptions: {

        }
    }
}*/

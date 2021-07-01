const path = require('path')
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [reactRefresh()],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'boost-web-forms'
        },
        minify: false,
        rollupOptions: {
            output: {
                globals: {
                    'boost-web-core': 'boost-web-core',
                    'vdtree': 'vdtree'
                }
            },
            external: ['vdtree', 'boost-web-core']
        }
    }
})

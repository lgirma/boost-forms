const path = require('path')
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'boost-forms'
        },
        minify: false,
        rollupOptions: {
            output: {
                globals: {
                    'boost-web-core': 'boost-web-core'
                }
            },
            external: ['boost-web-core']
        }
    }
})

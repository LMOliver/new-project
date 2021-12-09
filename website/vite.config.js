import { defineConfig } from 'vite';

export default defineConfig({
	root: './',
	assetsInclude: ['**/*.md'],
	publicDir: './public',
	build: {
		target: 'esnext',
		assetsInlineLimit: 1024,
		outDir: './deploy/public',
		minify: 'terser',
		rollupOptions: {
			output: {
				compact: true,
				generatedCode: 'es2015',
			},
		},
	},
	esbuild: {
		charset: 'utf8',
	},
	server: {
		port: 3000,
		fs: {
			allow: ['../'],
		},
	},
});
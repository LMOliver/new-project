export default {
	root: './',
	assetsInclude: ['**/*.md'],
	build: {
		target: 'esnext',
		assetsInlineLimit: 1024,
		outDir: './deploy',
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
		port: 2333,
		fs: {
			allow: ['../'],
		},
	},
};
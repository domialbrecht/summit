import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';
import pkg from './package.json';

export default defineConfig({
	plugins: [enhancedImages(), sveltekit()],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	}
});

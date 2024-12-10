import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

  daisyui: {
    logs: false
  },

	plugins: [daisyui]
} satisfies Config;

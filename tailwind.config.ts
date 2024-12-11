import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	daisyui: {
		logs: false,
		themes: [
			{
				solytheme: {
					primary: '#f43f5e',
					'primary-content': '#fff',
					secondary: '#d1d5db',
					'secondary-content': '#101011',
					accent: '#f43f5e',
					'accent-content': '#f3f4f6',
					neutral: '#d1d5db',
					'neutral-content': '#101011',
					'base-100': '#ffffff',
					'base-200': '#e5e7eb',
					'base-300': '#d1d5db',
					'base-content': '#374151',
					info: '#d1d5db',
					'info-content': '#101011',
					success: '#bbf7d0',
					'success-content': '#0d1510',
					warning: '#fef08a',
					'warning-content': '#161407',
					error: '#fb7185',
					'error-content': '#150406'
				}
			}
		]
	},

	plugins: [daisyui]
} satisfies Config;

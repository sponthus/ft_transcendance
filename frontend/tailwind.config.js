const { transform } = require('typescript');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,js}"],
  theme: {
    extend: {
		animation: {
			'wiggle': 'wiggle 3s ease-in-out infinite',
			'explode-particles': 'explode-particles 1.5s ease-out forwards',
		},
		keyframes: {
			wiggle: {
				'0%, 100%': {
					transform: 'translateY(-5%)',
					height: '100%',
      				width: '100%' },
				'50%': { 
					transform: 'none',
					height: '100%',
      				width: '100%' },
			},
			'explode-particles': {
				'0%': { 
					transform: 'scale(1) rotate(0deg)',
					opacity: '1' },
				'50%': {
					transform: 'scale(2) rotatate(180deg)',
					opacity: '0.6' },
				'100%': {
					transform: 'scale(0) rotate(360deg)',
					opacity: '0' },
			}
		}
	},
  },
  plugins: [],
}


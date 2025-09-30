const { transform } = require('typescript');


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,js}"],
  theme: {
    extend: {
		animation: {
			'wiggle': 'wiggle 3s ease-in-out infinite',
			'explode-particles': 'explode-particles 1.5s ease-out forwards ',
			'typing': 'typing 1s steps(20) infinite alternate, blink .7s infinite',
		},
		keyframes: {
			wiggle: {
				'0%, 100%': {
					transform: 'translateY(-5%)',},
				'50%': { 
					transform: 'none',},
			},
			'explode-particles': {
				'0%': { 
					transform: 'scale(1) rotate(0deg)',
					opacity: '1' },
				'50%': {
					transform: 'scale(2) rotate(180deg)',
					opacity: '0.6' },
				'100%': {
					transform: 'scale(0) rotate(360deg)',
					opacity: '0' },
			},
			typing: {
				'0%': {
					width: '0%',
					visibility: 'hidden' },
				'100%': {
					width: '100%' }
			},
			blink: {
				'50%' : {
				borderColor: 'transparent'},
				'100%' : {
				borderColor: 'white'},
			}
		}
	},
  },
  plugins: [],
}


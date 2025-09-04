/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,js}"],
  theme: {
    extend: {
		animation: {
			'wiggle': 'wiggle 3s ease-in-out infinite',
		},
		keyframes: {
			wiggle: {
				'0%, 100%': {
					transform: 'translateY(-5%)',
					height: '100%',
      				width: '100%',
				},
				'50%': { 
					transform: 'none',
					height: '100%',
      				width: '100%'
				},
					 }
		}
	},
  },
  plugins: [],
}


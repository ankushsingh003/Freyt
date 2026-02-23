export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#05070a",
                accent: {
                    blue: "#3b82f6",
                    purple: "#8b5cf6",
                    cyan: "#06b6d4"
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

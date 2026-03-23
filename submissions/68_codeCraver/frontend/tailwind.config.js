/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "var(--bg)",
                bg2: "var(--bg2)",
                text: "var(--text)",
                text2: "var(--text2)",
                text3: "var(--text3)",
                border: "var(--border)",
                accent: "var(--accent)",
                accentLight: "var(--accent-light)",
            }
        },
    },
    plugins: [],
}

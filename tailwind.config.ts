import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      maxWidth: {
        120: '430px',
        150: '480px',
        200: '550px',
      },
      maxHeight: {
        120: '430px',
        150: '480px',
        200: '550px',
      },
      boxShadow: {
        '3xl': '0 10px 30px 0px rgba(0, 0, 0, 0.5)',
        '4xl': '0 10px 40px 0px rgba(0, 0, 0, 0.5)',
        '5xl': '0 10px 50px 0px rgba(0, 0, 0, 0.5)',
        '6xl': '0 15px 60px 0px rgba(0, 0, 0, 0.5)',
        '7xl': '0 10px 900px 200px rgba(0, 0, 0, 0.5)',
      },
      transitionDuration: {
        2000: '2000ms',
        3000: '3000ms',
        4000: '4000ms',
      }
    },
  },
  plugins: [],
};
export default config;

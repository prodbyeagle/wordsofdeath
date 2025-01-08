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

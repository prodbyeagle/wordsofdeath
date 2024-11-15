import "./globals.css";
import Navbar from '../components/Navbar';

//! UNCOMMENT THIS WHEN COMMITING...
import { Inter_Tight } from 'next/font/google'
const sg = Inter_Tight({ fallback: ["inter-tight, system-ui"], subsets: ['latin'] })

export const metadata = {
  icons: {
    icon: '/skull.webp',
  },
  title: "WordsOfDeath",
  description: "Words of Death. Nothing more...",
  openGraph: {
    title: "WordsOfDeath",
    description: "Words of Death. Nothing more...",
    url: "https://wordsofdeath.vercel.app/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.openGraph?.title} />
        <meta property="og:description" content={metadata.openGraph?.description} />
        <meta property="og:url" content={metadata.openGraph?.url} />
        <meta property="og:type" content="website" />
        <link rel="icon" href={metadata.icons.icon} />
      </head>
      <body className={sg.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

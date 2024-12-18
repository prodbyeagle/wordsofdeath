import "./globals.css";
import Navbar from '../components/Navbar';

//! UNCOMMENT THIS WHEN COMMITING...
import { Inter_Tight } from 'next/font/google'
const sg = Inter_Tight({ fallback: ["inter-tight, system-ui"], subsets: ['latin'] })

export const metadata = {
  icons: {
    icon: '/skull.webp',
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
        <link rel="icon" href={metadata.icons.icon} />
      </head>
      <body className={sg.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

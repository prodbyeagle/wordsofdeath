
import "./globals.css";
import Navbar from '../components/Navbar';
import { Inter_Tight } from 'next/font/google'

const Inter = Inter_Tight({ fallback: ["inter-tight, system-ui"], subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body className={Inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

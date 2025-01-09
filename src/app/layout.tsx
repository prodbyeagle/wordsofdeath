import "./globals.css";
import Navbar from '../components/Navbar';

import { DM_Sans } from 'next/font/google'
const sg = DM_Sans({ fallback: ["system-ui"], subsets: ['latin'] })

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
        <meta name="google-site-verification" content="hzsS2qiDIdpqUiOcQrA-Dou7pxxilhW0INsyVueX7jY" />
      </head>
      <body className={sg.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

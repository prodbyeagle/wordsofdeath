import "./globals.css";
import Navbar from '@/components/ui/Navbar';

import { DM_Sans } from 'next/font/google'
const font = DM_Sans({ fallback: ["system-ui"], subsets: ['latin-ext'] })

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
    <html className="cursor-default select-none" lang="en">
      <head>
        <link rel="icon" href={metadata.icons.icon} />
        <meta name="google-site-verification" content="hzsS2qiDIdpqUiOcQrA-Dou7pxxilhW0INsyVueX7jY" />
        <meta name="theme-color" content="#171717" />#
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#171717" />
      </head>
      <body className={font.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

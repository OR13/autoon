import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Autoon – Model with TOON',
  description: 'Model class, instance, process and workflow using TOON format. Visualize, validate, and share.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/litegraph.js@0.7.18/css/litegraph.css" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

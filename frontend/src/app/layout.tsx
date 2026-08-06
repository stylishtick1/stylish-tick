import type { Metadata } from 'next';
import './globals.css';
import Providers from '../components/Providers';
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Stylish Tick | Premium Luxury Watch Collection",
  description: "Explore and purchase heritage horology watches. Shop Rolex, Omega, Seiko, Titan, and Fossil timepieces.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

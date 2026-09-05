import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vorticore Studio',
  description: 'A booster rocket for digital product teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

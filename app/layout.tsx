import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'AMPLOP · Development preview', template: '%s · AMPLOP' },
  description: 'Development foundation for the AMPLOP invitation platform.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}

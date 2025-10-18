import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { ReactNode } from 'react';
import ClientShell from '../components/ClientShell';

export const metadata = { title: 'WeBuild360' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
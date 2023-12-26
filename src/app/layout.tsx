import "./styles/mantineBase.css";
import type { Metadata } from 'next';
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import './globals.css';
import RecoilProvider from './RecoilProvider';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <RecoilProvider>
          <MantineProvider>{children}</MantineProvider>
        </RecoilProvider>
      </body>
    </html>
  );
}

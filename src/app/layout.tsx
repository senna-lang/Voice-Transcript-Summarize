import "./styles/mantineBase.css";
import './styles/globals.css';
import '@mantine/core/styles.css';
import type { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import RecoilProvider from './RecoilProvider';

export const metadata: Metadata = {
  title: 'VTS',
  description: 'Voice-Transcript-Summarize',
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
      <body className="text-black">
        <RecoilProvider>
          <MantineProvider>{children}</MantineProvider>
        </RecoilProvider>
      </body>
    </html>
  );
}

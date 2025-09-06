import type { Metadata } from 'next'
import { Providers } from './providers'
import { Chatbot } from '@/components/chatbot'
import './globals.css'

export const metadata: Metadata = {
  title: 'NewsBridge',
  description: 'A comprehensive news analysis platform with AI-powered insights',
  keywords: ['news', 'analysis', 'AI', 'articles', 'insights'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Chatbot />
        </Providers>
      </body>
    </html>
  )
}

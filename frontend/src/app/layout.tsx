import type { Metadata } from 'next'
import './globals.css'
import { headers } from 'next/headers'
import ContextProvider from '@/context'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  metadataBase: new URL('https://mailora.xyz'),
  title: 'Mailora - AI-Powered Decentralized Web3 Messaging on BotChain',
  description: 'Next-generation, end-to-end encrypted Web3 mailbox on BOT Chain with AI Smart Compose, threat detection, and summarization.',
  openGraph: {
    title: 'Mailora - AI-Powered Decentralized Web3 Messaging',
    description: 'End-to-End Encrypted, Zero-Knowledge Mailbox on BotChain with Native AI Superpowers.',
    url: 'https://mailora.xyz',
    siteName: 'Mailora',
    images: [
      {
        url: '/icon.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mailora - AI-Powered Decentralized Web3 Messaging',
    description: 'End-to-End Encrypted, Zero-Knowledge Mailbox on BotChain with Native AI Superpowers.',
    images: ['/icon.png'],
  },
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en" className="dark">
      <body className="bg-[#06090e] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 antialiased font-sans">
        <ContextProvider cookies={cookies}>
          {children}
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#0d131f',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              fontSize: '13px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
            }
          }} />
        </ContextProvider>
      </body>
    </html>
  )
}
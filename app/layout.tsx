import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'SlawsNigeria - Automation & Growth Engine',
  description: 'Empowering Nigerian women through Events, Products, and Mentorship. Subscribe on WhatsApp for daily updates.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  )
}

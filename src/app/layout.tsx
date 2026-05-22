import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Zocket Backlog',
  description: 'PM backlog tool for Zocket — AI marketing platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background min-h-screen">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}

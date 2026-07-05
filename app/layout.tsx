import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Vertexia CRM',
    template: '%s | Vertexia CRM',
  },
  description:
    'CRM for Vertexia — manage leads, track calls, generate AI scripts, and convert clients. Built for the Vertexia web development agency in Karachi.',
  keywords: ['CRM', 'leads', 'sales', 'web development', 'Karachi', 'Vertexia'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}

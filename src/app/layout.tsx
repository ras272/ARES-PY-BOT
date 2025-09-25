import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WhatsApp Bot ARES',
  description: 'Bot de WhatsApp con IA para ARES Paraguay',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

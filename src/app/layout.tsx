import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sistema de Gestión de Documentos - ESPOCH',
  description: 'Sistema de gestión de documentos para docentes de la Universidad ESPOCH',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}

import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { ToastProvider } from "@/components/ui/toast"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Annuaire Digital des Centres d'Urgence du Madagascar",
  description: "Trouvez facilement les centres de santé près de chez vous au Madagascar. Recherchez par ville, spécialité, services disponibles et plus encore.",
  keywords: "santé, Madagascar, centres de santé, hôpitaux, cliniques, médecine, urgences",
  authors: [{ name: "Iroy" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Annuaire Digital des Centres d'Urgence du Madagascar",
    description: "Trouvez facilement les centres de santé près de chez vous au Madagascar",
    type: "website",
    locale: "fr_FR",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
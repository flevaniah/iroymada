'use client'

import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icône et titre */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🏥</div>
          <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Page non trouvée
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Que souhaitez-vous faire ?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Home className="h-6 w-6" />
                <span className="text-sm">Accueil</span>
              </Button>
            </Link>
            
            <Link href="/recherche">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Search className="h-6 w-6" />
                <span className="text-sm">Rechercher</span>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full h-auto p-4 flex flex-col items-center space-y-2"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="text-sm">Retour</span>
            </Button>
          </div>
        </div>

        {/* Centres populaires */}
        <div className="text-left">
          <h3 className="text-lg font-semibold mb-4">Recherches populaires</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Urgences Brazzaville',
              'Maternité Pointe-Noire',
              'Laboratoire',
              'Centres 24/7',
              'Hôpitaux publics'
            ].map((search, index) => (
              <Link
                key={index}
                href={`/recherche?q=${encodeURIComponent(search)}`}
                className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20 transition-colors"
              >
                {search}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
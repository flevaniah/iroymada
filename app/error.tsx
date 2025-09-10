'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {

  }, [error])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
       
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-coral-light p-4 rounded-full">
              <AlertTriangle className="h-12 w-12 text-coral" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Oops ! Une erreur est survenue
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Nous rencontrons un problème technique temporaire. 
            Veuillez réessayer dans quelques instants.
          </p>
        </div>

   
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-coral-light border border-coral-lighter rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-coral mb-2">Détails de l'erreur :</h3>
            <p className="text-sm text-coral font-mono">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-coral mt-2">
                ID: {error.digest}
              </p>
            )}
          </div>
        )}

       
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Le problème persiste ?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Si cette erreur continue de se produire, n'hésitez pas à nous contacter.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
            <span className="text-muted-foreground">📧 contact@sante-Madagascar.cg</span>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <span className="text-muted-foreground">📞 +242 06 000 00 00</span>
          </div>
        </div>
      </div>
    </div>
  )
}
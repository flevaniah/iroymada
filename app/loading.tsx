import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Animation de chargement */}
        <div className="relative">
          <div className="text-6xl mb-4">🏥</div>
          <Loader2 className="h-8 w-8 animate-spin text-primary absolute -bottom-2 -right-2" />
        </div>
        
        {/* Texte de chargement */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Chargement en cours...
          </h2>
          <p className="text-muted-foreground">
            Nous préparons les informations sur les centres de santé
          </p>
        </div>
        
        {/* Barre de progression animée */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
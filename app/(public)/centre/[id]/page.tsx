'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Stethoscope,
  Car,
  Accessibility,
  Bus,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageGallery } from '@/components/ui/image-gallery'
import { useCenterStore } from '@/lib/store'
import { CENTER_TYPES, JOURS_SEMAINE } from '@/lib/constants'
import { trackCenterView, trackCenterContact } from '@/lib/tracking'

export default function CentrePage() {
  const params = useParams()
  const id = params.id as string
  
  const { center, isLoading, error, fetchCenter } = useCenterStore()

  useEffect(() => {
    if (id) {
      fetchCenter(id)
    }
  }, [id, fetchCenter])

  // Track la consultation du centre quand les données sont chargées
  useEffect(() => {
    if (center && !isLoading) {
      // Utiliser real_id pour le tracking (UUID réel) au lieu de l'ID encodé
      trackCenterView(center.real_id || center.id, center.center_type)
    }
  }, [center, isLoading])

  if (isLoading) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !center) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏥</div>
            <h1 className="text-2xl font-bold mb-2">Centre non trouvé</h1>
            <p className="text-muted-foreground mb-4">
              {error || 'Ce centre de santé n\'existe pas ou n\'est plus disponible.'}
            </p>
            <Link href="/recherche">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la recherche
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatHoraires = (horaires: any) => {
    if (!horaires) return null
    
    return JOURS_SEMAINE.map(jour => {
      const horaire = horaires[jour]
      if (!horaire) return null
      
      return (
        <div key={jour} className="flex justify-between py-1">
          <span className="capitalize font-medium">{jour}</span>
          <span>
            {horaire.ouvert 
              ? `${horaire.debut} - ${horaire.fin}`
              : 'Fermé'
            }
          </span>
        </div>
      )
    }).filter(Boolean)
  }

  return (
    <div className="bg-background">
      {/* Header avec navigation */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/recherche">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la recherche
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* En-tête du centre */}
        <div className="mb-8">
          {/* Images du centre */}
          {center.photos && center.photos.length > 0 && (
            <ImageGallery 
              images={center.photos} 
              alt={center.name}
            />
          )}

          {/* Titre et badges */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {center.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-md font-medium">
                  {CENTER_TYPES[center.center_type as keyof typeof CENTER_TYPES]}
                </span>
                {center.emergency_24h && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-md font-medium">
                    Urgences 24/7
                  </span>
                )}
                {center.wheelchair_accessible && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md font-medium">
                    ♿ Accessible
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {center.phone && (
                <Button asChild>
                  <a 
                    href={`tel:${center.phone}`}
                    onClick={() => trackCenterContact(center.id, center.center_type)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </a>
                </Button>
              )}
              {center.whatsapp && (
                <Button variant="outline" asChild>
                  <a 
                    href={`https://wa.me/${center.whatsapp.replace(/\s+/g, '')}`} 
                    target="_blank"
                    onClick={() => trackCenterContact(center.id, center.center_type)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {center.description && (
              <Card>
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {center.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {center.services && center.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Services disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {center.services.map((service, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-gray-50 rounded-md text-sm text-center"
                      >
                        {service}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Spécialités */}
            {center.specialties && center.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Spécialités médicales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {center.specialties.map((specialite, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-primary/5 text-primary rounded-md text-sm text-center font-medium"
                      >
                        {specialite}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Localisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adresse */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{center.full_address}</div>
                    <div className="text-sm text-muted-foreground">
                      {center.city}{center.district && `, ${center.district}`}
                    </div>
                  </div>
                </div>

                {/* Téléphone */}
                {center.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href={`tel:${center.phone}`}
                      className="hover:text-primary transition-colors"
                      onClick={() => trackCenterContact(center.id, center.center_type)}
                    >
                      {center.phone}
                    </a>
                  </div>
                )}

                {/* Email */}
                {center.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href={`mailto:${center.email}`}
                      className="hover:text-primary transition-colors"
                      onClick={() => trackCenterContact(center.id, center.center_type)}
                    >
                      {center.email}
                    </a>
                  </div>
                )}

                {/* Site web */}
                {center.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href={center.website}
                      target="_blank"
                      className="hover:text-primary transition-colors"
                    >
                      Site web
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Horaires */}
            {center.opening_hours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horaires d'ouverture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {center.emergency_24h ? (
                    <div className="text-center py-4">
                      <div className="text-lg font-semibold text-green-600 mb-2">
                        24 heures sur 24
                      </div>
                      <div className="text-sm text-muted-foreground">
                        7 jours sur 7
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      {formatHoraires(center.opening_hours)}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Accessibilité */}
            <Card>
              <CardHeader>
                <CardTitle>Accessibilité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Accessibility className="h-5 w-5 text-muted-foreground" />
                  <span className={center.wheelchair_accessible ? 'text-green-600' : 'text-gray-400'}>
                    {center.wheelchair_accessible ? 'Accessible aux PMR' : 'Non accessible aux PMR'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <span className={center.parking_available ? 'text-green-600' : 'text-gray-400'}>
                    {center.parking_available ? 'Parking disponible' : 'Pas de parking'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Bus className="h-5 w-5 text-muted-foreground" />
                  <span className={center.public_transport ? 'text-green-600' : 'text-gray-400'}>
                    {center.public_transport ? 'Accessible en transport' : 'Transport limité'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
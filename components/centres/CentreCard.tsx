import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Clock, Star, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { HealthCenter } from '@/types/database'
import { CENTER_TYPES } from '@/lib/constants'

interface CenterCardProps {
  center: HealthCenter
  showDistance?: boolean
}

export function CenterCard({ center, showDistance = false }: CenterCardProps) {
  const hasEmergency = center.emergency_24h
  const hasAccessibility = center.wheelchair_accessible
  
  return (
    <Link href={`/centre/${center.id}`} className="block">
      <Card className="centre-card h-full transition-all duration-200 hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                {center.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-md">
                  {CENTER_TYPES[center.center_type]}
                </span>
                {hasEmergency && (
                  <span className="text-xs px-2 py-1 bg-coral-light text-coral rounded-md font-medium">
                    24/7
                  </span>
                )}
              </div>
            </div>
            
            {center.photos && center.photos.length > 0 && (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ml-3">
                <Image
                  src={center.photos[0]}
                  alt={center.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Localisation */}
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <div>{center.full_address}</div>
              <div className="font-medium">{center.city}{center.district && `, ${center.district}`}</div>
              {showDistance && center.distance && (
                <div className="text-primary font-medium">
                  À {center.distance.toFixed(1)} km
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          {center.phone && (
            <div className="flex items-center gap-2 mb-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{center.phone}</span>
            </div>
          )}

          {/* Services principaux */}
          {center.services && center.services.length > 0 && (
            <div className="flex items-start gap-2 mb-3">
              <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-1">
                  {center.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {service}
                    </span>
                  ))}
                  {center.services.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      +{center.services.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Horaires simplifiés */}
          {center.opening_hours && (
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {hasEmergency ? '24h/24, 7j/7' : 'Voir les horaires'}
              </span>
            </div>
          )}

          {/* Badges d'accessibilité */}
          <div className="flex gap-2 mt-4">
            {hasAccessibility && (
              <span className="text-xs px-2 py-1 bg-info-light text-info rounded-md">
                ♿ Accessible
              </span>
            )}
            {center.parking_available && (
              <span className="text-xs px-2 py-1 bg-teal-light text-teal rounded-md">
                🅿️ Parking
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
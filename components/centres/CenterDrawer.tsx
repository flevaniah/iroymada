'use client';

import React from 'react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink, 
  Accessibility,
  Car,
  Bus,
  AlertCircle,
  Navigation
} from 'lucide-react';
import { HealthCenter } from '@/types/database';
import { getMarkerConfig } from '@/lib/mapMarkers';
import { JOURS_SEMAINE } from '@/lib/constants';
import { openMapAndNavigate } from '@/lib/navigation-events';
import Link from 'next/link';

interface CenterDrawerProps {
  center: HealthCenter | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CenterDrawer({ center, isOpen, onClose }: CenterDrawerProps) {
  if (!center) return null;

  const markerConfig = getMarkerConfig(center.center_type);

  // Fonction pour formater les horaires
  const formatHoraires = (horaires: any) => {
    if (!horaires) return null;
    
    return JOURS_SEMAINE.map(jour => {
      const horaire = horaires[jour];
      if (!horaire) return null;
      
      return (
        <div key={jour} className="flex justify-between py-1">
          <span className="capitalize font-medium text-sm">{jour}</span>
          <span className="text-sm">
            {horaire.ouvert 
              ? `${horaire.debut} - ${horaire.fin}`
              : 'Fermé'
            }
          </span>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={center.name}
      side="left"
    >
      <div className="flex flex-col h-full">
        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        
        {/* Photos */}
        {center.photos && center.photos.length > 0 && (
          <div>
            <div className="rounded-lg overflow-hidden mb-4">
              <img 
                src={center.photos[0]} 
                alt={center.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  // Si l'image ne charge pas, afficher une image par défaut
                  (e.target as HTMLImageElement).src = '/images/placeholder-center.jpg';
                }}
              />
            </div>
            {center.photos.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {center.photos.slice(1, 4).map((photo, index) => (
                  <img 
                    key={index}
                    src={photo} 
                    alt={`${center.name} - ${index + 2}`}
                    className="w-full h-16 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Type et statut */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <img 
              src={markerConfig.iconUrl} 
              alt={markerConfig.label}
              className="w-8 h-8 object-contain"
            />
            <span className="font-medium text-gray-900">{markerConfig.label}</span>
          </div>
          
          {center.emergency_24h && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Urgences 24h/24</span>
            </div>
          )}
        </div>

        {/* Description */}
        {center.description && (
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-gray-600">{center.description}</p>
          </div>
        )}

        {/* Adresse */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Adresse
          </h4>
          <p className="text-sm text-gray-600">{center.full_address}</p>
          <p className="text-sm text-gray-500">{center.city}</p>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact
          </h4>
          
          {center.phone && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Téléphone principal</span>
              <a 
                href={`tel:${center.phone}`}
                className="text-primary hover:underline text-sm"
              >
                {center.phone}
              </a>
            </div>
          )}
          
          {center.secondary_phone && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Téléphone secondaire</span>
              <a 
                href={`tel:${center.secondary_phone}`}
                className="text-primary hover:underline text-sm"
              >
                {center.secondary_phone}
              </a>
            </div>
          )}
          
          {center.whatsapp && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">WhatsApp</span>
              <a 
                href={`https://wa.me/${center.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline text-sm"
              >
                {center.whatsapp}
              </a>
            </div>
          )}
          
          {center.email && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email</span>
              <a 
                href={`mailto:${center.email}`}
                className="text-primary hover:underline text-sm"
              >
                {center.email}
              </a>
            </div>
          )}
          
          {center.website && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Site web</span>
              <a 
                href={center.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm flex items-center gap-1"
              >
                Visiter <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Services */}
        {center.services && center.services.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Services</h4>
            <div className="flex flex-wrap gap-1">
              {center.services.map((service, index) => (
                <span 
                  key={index}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Spécialités */}
        {center.specialties && center.specialties.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Spécialités</h4>
            <div className="flex flex-wrap gap-1">
              {center.specialties.map((specialty, index) => (
                <span 
                  key={index}
                  className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Accessibilité */}
        <div>
          <h4 className="font-medium mb-2">Accessibilité</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Accessibility className={`h-4 w-4 ${center.wheelchair_accessible ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={center.wheelchair_accessible ? 'text-green-600' : 'text-gray-500'}>
                {center.wheelchair_accessible ? 'Accessible aux personnes handicapées' : 'Non accessible'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Car className={`h-4 w-4 ${center.parking_available ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={center.parking_available ? 'text-green-600' : 'text-gray-500'}>
                {center.parking_available ? 'Parking disponible' : 'Pas de parking'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bus className={`h-4 w-4 ${center.public_transport ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={center.public_transport ? 'text-green-600' : 'text-gray-500'}>
                {center.public_transport ? 'Accessible en transport public' : 'Transport public limité'}
              </span>
            </div>
          </div>
        </div>

        {/* Horaires */}
        {center.opening_hours && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horaires d'ouverture
            </h4>
            {center.emergency_24h ? (
              <div className="text-start py-2">
                <div className="text-sm font-semibold text-green-600 mb-1">
                  24 heures sur 24
                </div>
                <div className="text-xs text-gray-500">
                  7 jours sur 7
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {formatHoraires(center.opening_hours)}
              </div>
            )}
          </div>
        )}

        </div>
        
        {/* Footer fixe avec boutons */}
        <div className="border-t bg-background p-4 flex-shrink-0 space-y-3">
          <Link href={`/centre/${center.id}`} className="w-full">
            <Button className="w-full">
              Voir tous les détails
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>

          {/* Bouton Itinéraire (remplace localisation) */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onClose(); // Fermer le drawer
              openMapAndNavigate(center); // Ouvrir la carte et démarrer la navigation
            }}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Itinéraire
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

export default CenterDrawer;
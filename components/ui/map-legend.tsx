'use client';

import { useState } from 'react';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMarkerConfig } from '@/lib/mapMarkers';
import { CenterType } from '@/types/database';

// Types de centres disponibles
const CENTER_TYPES: { key: CenterType; label: string }[] = [
  { key: 'public_hospital', label: 'Hôpital Public' },
  { key: 'private_hospital', label: 'Hôpital Privé' },
  { key: 'private_clinic', label: 'Clinique' },
  { key: 'health_center', label: 'Centre de Santé' },
  { key: 'medical_office', label: 'Cabinet Médical' },
  { key: 'pharmacy', label: 'Pharmacie' },
  { key: 'laboratory', label: 'Laboratoire' },
  { key: 'fire_station', label: 'Pompiers' },
  { key: 'police_station', label: 'Police' },
  { key: 'samu', label: 'SAMU' }
];

interface MapLegendProps {
  visibleTypes: CenterType[];
  onToggleType: (type: CenterType) => void;
  onShowAll?: () => void;
  onHideAll?: () => void;
  className?: string;
}

export function MapLegend({ visibleTypes, onToggleType, onShowAll, onHideAll, className = '' }: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className={`w-full max-w-xs h-full bg-background/95 backdrop-blur-sm shadow-lg border-2 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Légende des marqueurs
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
      <CardContent className="pt-0 flex flex-col max-h-[60vh] overflow-hidden"> 
        {/* Liste scrollable */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {CENTER_TYPES.map(({ key, label }) => {
            const config = getMarkerConfig(key);
            const isVisible = visibleTypes.includes(key);
            
            return (
              <div
                key={key}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                  isVisible ? 'bg-primary/10 hover:bg-primary/20' : 'bg-muted/30 hover:bg-muted/50 opacity-50'
                }`}
                onClick={() => onToggleType(key)}
              >
                <div className="w-5 h-5 flex-shrink-0">
                  <img src={config.iconUrl} alt={label} className="w-4 h-4 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{label}</div>
                </div>
                <div className="flex-shrink-0">
                  {isVisible ? <Eye className="h-3 w-3 text-primary" /> : <EyeOff className="h-3 w-3" />}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bouton fixé en bas */}
        <div className="mt-4 pt-3 border-t border-border flex-shrink-0">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs h-7"
              onClick={() => {
                if (onShowAll) {
                  onShowAll();
                } else {
                  // Fallback: appeler onToggleType pour chaque type non visible
                  CENTER_TYPES.forEach(({ key }) => {
                    if (!visibleTypes.includes(key)) {
                      onToggleType(key);
                    }
                  });
                }
              }}
              disabled={visibleTypes.length === CENTER_TYPES.length}
            >
              Tout afficher
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs h-7"
              onClick={() => {
                if (onHideAll) {
                  onHideAll();
                } else {
                  // Fallback: appeler onToggleType pour chaque type visible
                  CENTER_TYPES.forEach(({ key }) => {
                    if (visibleTypes.includes(key)) {
                      onToggleType(key);
                    }
                  });
                }
              }}
              disabled={visibleTypes.length === 0}
            >
              Tout masquer
            </Button>
          </div>
        </div>
      </CardContent>)
}
    </Card>
  );
}

// Version mobile - Bottom Sheet
export function MapLegendMobile({ visibleTypes, onToggleType, onShowAll, onHideAll, isOpen, onClose }: MapLegendProps & { isOpen: boolean, onClose: () => void }) {
  const handleToggleType = (key: CenterType) => {
    onToggleType(key);
  };

  const allTypes = CENTER_TYPES;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-end">
      <div className="bg-white rounded-t-lg w-full max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            {/* <div className="w-8 h-1 bg-gray-300 rounded-full" /> */}
          </div>
          <h3 className="text-lg font-semibold">Légende des marqueurs</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <EyeOff className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-2">
            {CENTER_TYPES.map(({ key, label }) => {
              const config = getMarkerConfig(key);
              const isVisible = visibleTypes.includes(key);
              
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                    isVisible ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-muted opacity-50'
                  }`}
                  onClick={() => handleToggleType(key)}
                >
                  <div className="w-6 h-6 flex-shrink-0">
                    <img src={config.iconUrl} alt={label} className="w-5 h-5 object-contain" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm font-medium">{label}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isVisible ? 'bg-primary border-primary' : 'bg-transparent border-muted-foreground'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Boutons fixés en bas */}
        <div className="border-t bg-background p-4 flex-shrink-0 space-y-2">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-12 text-base font-medium"
            onClick={() => {
              if (onShowAll) {
                onShowAll();
              } else {
                // Fallback
                allTypes.forEach(({ key }) => {
                  if (!visibleTypes.includes(key)) {
                    onToggleType(key);
                  }
                });
              }
            }}
            disabled={visibleTypes.length === allTypes.length}
          >
            Tout afficher
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-12 text-base font-medium"
            onClick={() => {
              if (onHideAll) {
                onHideAll();
              } else {
                // Fallback
                allTypes.forEach(({ key }) => {
                  if (visibleTypes.includes(key)) {
                    onToggleType(key);
                  }
                });
              }
            }}
            disabled={visibleTypes.length === 0}
          >
            Tout masquer
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MapLegend;
'use client'

import { getAllMarkerTypes } from '@/lib/mapMarkers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MapLegendProps {
  className?: string
}

export function MapLegend({ className = '' }: MapLegendProps) {
  const markerTypes = getAllMarkerTypes()

  return (
    <Card className={`absolute top-4 right-4 z-[1000] w-64 bg-white/95 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <span>🗺️</span>
          Types de centres
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {markerTypes.map(({ type, iconUrl, label, color }) => (
          <div key={type} className="flex items-center gap-3">
            <img 
              src={iconUrl} 
              alt={label} 
              className="w-5 h-5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-foreground font-medium">
                {label}
              </span>
              <div className={`h-1 w-full bg-${color} rounded-full mt-0.5`} />
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            📍 Cliquez sur un marqueur pour plus d'infos
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
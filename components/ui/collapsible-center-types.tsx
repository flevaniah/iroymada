'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CENTER_TYPES } from '@/lib/constants';

interface CollapsibleCenterTypesProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function CollapsibleCenterTypes({ selectedType, onTypeChange }: CollapsibleCenterTypesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedTypeLabel = selectedType && selectedType !== 'all' 
    ? CENTER_TYPES[selectedType as keyof typeof CENTER_TYPES] 
    : 'Tous les types';

  return (
    <div className="relative">
      {/* Bouton principal */}
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="truncate">{selectedTypeLabel}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 ml-2 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
        )}
      </Button>

      {/* Liste déroulante */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-1">
            {/* Option "Tous les types" */}
            <button
              className={`w-full text-left px-3 py-2 rounded-sm text-sm hover:bg-muted transition-colors ${
                !selectedType || selectedType === 'all' ? 'bg-muted' : ''
              }`}
              onClick={() => {
                onTypeChange('all');
                setIsExpanded(false);
              }}
            >
              Tous les types
            </button>
            
            {/* Options individuelles */}
            {Object.entries(CENTER_TYPES).map(([key, value]) => (
              <button
                key={key}
                className={`w-full text-left px-3 py-2 rounded-sm text-sm hover:bg-muted transition-colors ${
                  selectedType === key ? 'bg-muted' : ''
                }`}
                onClick={() => {
                  onTypeChange(key);
                  setIsExpanded(false);
                }}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay pour fermer en cliquant à l'extérieur */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

export default CollapsibleCenterTypes;
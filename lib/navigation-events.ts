// Utilitaires pour les événements de navigation personnalisés
import { HealthCenter } from '@/types/database';

export interface NavigationEventDetail {
  destination: HealthCenter;
}

// Événement pour ouvrir la carte en plein écran
export const openFullscreenMap = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('openFullscreenMap'));
  }
};

// Événement pour démarrer la navigation vers une destination
export const startNavigation = (destination: HealthCenter) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('startNavigation', {
      detail: { destination }
    }));
  }
};

// Combinaison des deux : ouvrir la carte plein écran ET démarrer la navigation
export const openMapAndNavigate = (destination: HealthCenter) => {
  openFullscreenMap();
  // Attendre que la carte s'ouvre avant de démarrer la navigation
  setTimeout(() => {
    startNavigation(destination);
  }, 100);
};

// Types pour les event listeners
export type NavigationEventHandler = (event: CustomEvent<NavigationEventDetail>) => void;
export type FullscreenMapEventHandler = (event: CustomEvent) => void;

// Helpers pour ajouter/retirer les event listeners
export const addNavigationListeners = (
  onStartNavigation: NavigationEventHandler,
  onOpenFullscreenMap?: FullscreenMapEventHandler
) => {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('startNavigation', onStartNavigation as EventListener);
  if (onOpenFullscreenMap) {
    window.addEventListener('openFullscreenMap', onOpenFullscreenMap as EventListener);
  }

  // Retourner une fonction de nettoyage
  return () => {
    window.removeEventListener('startNavigation', onStartNavigation as EventListener);
    if (onOpenFullscreenMap) {
      window.removeEventListener('openFullscreenMap', onOpenFullscreenMap as EventListener);
    }
  };
};

const navigationEvents = {
  openFullscreenMap,
  startNavigation,
  openMapAndNavigate,
  addNavigationListeners
};

export default navigationEvents;
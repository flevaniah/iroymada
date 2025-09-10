/**
 * Utilitaire pour encoder/décoder les IDs des centres pour masquer les vrais IDs UUID
 */

// Clé secrète simple pour l'encodage (en production, utiliser une vraie clé secrète)
const SECRET_KEY = process.env.ID_ENCODER_KEY || 'iroy-fianarantsoa-2025';

/**
 * Encode un UUID en identifiant plus court et masqué
 */
export function encodeId(uuid: string): string {
  // Prendre les 8 premiers caractères de l'UUID
  const shortId = uuid.replace(/-/g, '').substring(0, 8);
  
  // Convertir en nombre hexadécimal puis en base36 pour raccourcir
  const numericValue = parseInt(shortId, 16);
  const encoded = numericValue.toString(36);
  
  // Ajouter un préfixe pour la sécurité
  return `c${encoded}`;
}

/**
 * Décode un identifiant encodé vers l'UUID original
 * Utilise une approche différente pour éviter LIKE sur UUID
 */
export function decodeIdToSearchTerm(encodedId: string): string {
  if (!encodedId.startsWith('c')) {
    throw new Error('Invalid encoded ID format');
  }
  
  // Retirer le préfixe 'c'
  const encoded = encodedId.substring(1);
  
  // Convertir de base36 vers hexadécimal
  const numericValue = parseInt(encoded, 36);
  const hex = numericValue.toString(16).padStart(8, '0');
  
  // Retourner juste le hex pour recherche
  return hex;
}

/**
 * Créer un mapping ID encodé vers UUID pour éviter les recherches répétées
 */
export interface IdMapping {
  encoded: string;
  uuid: string;
}

export function createIdMapping(centers: Array<{id: string, name: string}>): IdMapping[] {
  return centers.map(center => ({
    encoded: encodeId(center.id),
    uuid: center.id
  }));
}

/**
 * Trouver l'UUID à partir de l'ID encodé dans un mapping
 */
export function findUuidFromEncoded(encoded: string, mappings: IdMapping[]): string | null {
  const mapping = mappings.find(m => m.encoded === encoded);
  return mapping ? mapping.uuid : null;
}
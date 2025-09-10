import { supabase } from '@/lib/supabase';

/**
 * Gestionnaire d'images pour Supabase Storage
 * Gère l'upload, la suppression et le nettoyage des images
 */
export class ImageManager {
  private static readonly BUCKET_NAME = 'health-centers-images';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Upload une image vers Supabase Storage
   */
  static async uploadImage(file: File, centerId?: string): Promise<string> {
    // Validation
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('Le fichier est trop volumineux. Taille maximale: 5MB');
    }

    // Générer un nom unique pour le fichier
    const fileExt = file.name.split('.').pop();
    const fileName = `${centerId || 'temp'}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = centerId ? `centers/${centerId}/${fileName}` : `temp/${fileName}`;


    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
     
        throw new Error(`Erreur d'upload: ${error.message}`);
      }

      
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

   
      return publicUrl;

    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Supprimer une image de Supabase Storage
   */
  static async deleteImage(imageUrl: string): Promise<boolean> {
    if (!imageUrl) return true;

    try {
      // Extraire le chemin du fichier depuis l'URL
      const filePath = this.extractFilePathFromUrl(imageUrl);
      if (!filePath) {
       
        return false;
      }

     

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        
        return false;
      }

     
      return true;

    } catch (error) {
      
      return false;
    }
  }

  /**
   * Supprimer plusieurs images
   */
  static async deleteImages(imageUrls: string[]): Promise<{success: string[], failed: string[]}> {
    const results = await Promise.allSettled(
      imageUrls.map(url => this.deleteImage(url))
    );

    const success: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        success.push(imageUrls[index]);
      } else {
        failed.push(imageUrls[index]);
      }
    });

  
    return { success, failed };
  }

  /**
   * Nettoyer les images supprimées (différentiel)
   * Compare les anciennes et nouvelles images pour supprimer celles qui ne sont plus utilisées
   */
  static async cleanupImages(oldImages: string[], newImages: string[]): Promise<void> {
    const imagesToDelete = oldImages.filter(oldImage => 
      oldImage && !newImages.includes(oldImage)
    );

    if (imagesToDelete.length > 0) {
      
      const { failed } = await this.deleteImages(imagesToDelete);
      
      if (failed.length > 0) {
       
      }
    }
  }

  /**
   * Supprimer toutes les images d'un centre
   */
  static async deleteAllCenterImages(centerId: string): Promise<boolean> {
    try {
      

      // Lister tous les fichiers du centre
      const { data: files, error: listError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(`centers/${centerId}`, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (listError) {
       
        return false;
      }

      if (!files || files.length === 0) {
       
        return true;
      }

      // Construire les chemins complets
      const filePaths = files.map(file => `centers/${centerId}/${file.name}`);

      // Supprimer tous les fichiers
      const { error: deleteError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) {
        
        return false;
      }

   
      return true;

    } catch (error) {
     
      return false;
    }
  }

  /**
   * Nettoyer les images temporaires (plus de 24h)
   */
  static async cleanupTempImages(): Promise<void> {
    try {


      const { data: files, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('temp', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'asc' }
        });

      if (error || !files) {
        
        return;
      }

      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);

      const oldFiles = files.filter(file => {
        const createdAt = new Date(file.created_at || '').getTime();
        return createdAt < oneDayAgo;
      });

      if (oldFiles.length > 0) {
        const filePaths = oldFiles.map(file => `temp/${file.name}`);
        
        const { error: deleteError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove(filePaths);

        if (!deleteError) {
   
        } else {
         
        }
      }

    } catch (error) {
  
    }
  }

  /**
   * Extraire le chemin du fichier depuis l'URL Supabase
   */
  private static extractFilePathFromUrl(url: string): string | null {
    try {
      // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      
      // Trouver l'index du bucket dans le chemin
      const bucketIndex = pathSegments.findIndex(segment => segment === this.BUCKET_NAME);
      
      if (bucketIndex === -1 || bucketIndex >= pathSegments.length - 1) {
        return null;
      }

      const filePath = pathSegments.slice(bucketIndex + 1).join('/');
      return filePath || null;

    } catch (error) {
     
      return null;
    }
  }

  /**
   * Valider qu'une URL appartient à notre bucket
   */
  static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.includes(`/${this.BUCKET_NAME}/`);
    } catch {
      return false;
    }
  }
}

// Export des fonctions utilitaires
export const {
  uploadImage,
  deleteImage,
  deleteImages,
  cleanupImages,
  deleteAllCenterImages,
  cleanupTempImages,
  isValidImageUrl
} = ImageManager;
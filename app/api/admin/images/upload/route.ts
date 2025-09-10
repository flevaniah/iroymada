import { NextRequest, NextResponse } from "next/server";
import { ImageManager } from "@/lib/image-manager";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const centerId = formData.get('centerId') as string;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Upload l'image via ImageManager
    const imageUrl = await ImageManager.uploadImage(file, centerId);

    return NextResponse.json({
      imageUrl,
      message: "Image uploadée avec succès"
    });

  } catch (error) {

    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL d'image manquante" },
        { status: 400 }
      );
    }

    // Vérifier que l'URL appartient à notre bucket
    if (!ImageManager.isValidImageUrl(imageUrl)) {
      return NextResponse.json(
        { error: "URL d'image invalide" },
        { status: 400 }
      );
    }

    // Supprimer l'image
    const success = await ImageManager.deleteImage(imageUrl);

    if (success) {
      return NextResponse.json({
        message: "Image supprimée avec succès"
      });
    } else {
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      );
    }

  } catch (error) {

    
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
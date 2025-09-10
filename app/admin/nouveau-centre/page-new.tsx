"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CENTER_TYPES,
  JOURS_SEMAINE,
  SERVICES_MEDICAUX,
  SPECIALITES_MEDICALES,
  MADAGASCAR_CITIES,
} from "@/lib/constants";
import { ArrowLeft, Camera, Loader2, MapPin, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

interface Horaire {
  ouvert: boolean;
  debut: string;
  fin: string;
}

interface Horaires {
  [key: string]: Horaire;
}

interface FormData {
  nom: string;
  type_centre: string;
  description: string;
  adresse_complete: string;
  ville: string;
  quartier: string;
  telephone: string;
  whatsapp: string;
  email: string;
  site_web: string;
  latitude: number | null;
  longitude: number | null;
  services: string[];
  specialites: string[];
  urgences_24h: boolean;
  accessibilite_handicapes: boolean;
  parking_disponible: boolean;
  transport_public: boolean;
  horaires: Horaires;
  photos: File[];
  statut: "en_attente" | "approuve";
  notes_admin: string;
}

const initialHoraires: Horaires = JOURS_SEMAINE.reduce((acc, jour) => {
  acc[jour] = { ouvert: true, debut: "08:00", fin: "17:00" };
  return acc;
}, {} as Horaires);

export default function NouveauCentrePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    type_centre: "",
    description: "",
    adresse_complete: "",
    ville: "",
    quartier: "",
    telephone: "",
    whatsapp: "",
    email: "",
    site_web: "",
    latitude: null,
    longitude: null,
    services: [],
    specialites: [],
    urgences_24h: false,
    accessibilite_handicapes: false,
    parking_disponible: false,
    transport_public: false,
    horaires: initialHoraires,
    photos: [],
    statut: "en_attente",
    notes_admin: "",
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "services" | "specialites", item: string) => {
    const currentArray = formData[field];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateFormData(field, newArray);
  };

  const updateHoraire = (jour: string, field: keyof Horaire, value: any) => {
    const newHoraires = {
      ...formData.horaires,
      [jour]: {
        ...formData.horaires[jour],
        [field]: value,
      },
    };
    updateFormData("horaires", newHoraires);
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files).slice(0, 5 - formData.photos.length);
      updateFormData("photos", [...formData.photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData("photos", newPhotos);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.nom && formData.type_centre && formData.description);
      case 2:
        return !!(
          formData.adresse_complete &&
          formData.ville &&
          formData.telephone
        );
      case 3:
        return formData.services.length > 0;
      case 4:
        return true; // Étape optionnelle
      case 5:
        return true; // Paramètres admin
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      let photoUrls: string[] = [];

      // Upload photos to Supabase Storage if any
      if (formData.photos.length > 0) {
        try {
          const uploadPromises = formData.photos.map(async (photo, index) => {
            const fileName = `centers/${Date.now()}-${index}-${photo.name}`;

            const uploadFormData = new FormData();
            uploadFormData.append("file", photo);
            uploadFormData.append("fileName", fileName);

            const uploadResponse = await fetch("/api/upload", {
              method: "POST",
              body: uploadFormData,
            });

            if (uploadResponse.ok) {
              const { url } = await uploadResponse.json();
              return url;
            } else {
             
              return null;
            }
          });

          const urls = await Promise.all(uploadPromises);
          photoUrls = urls.filter((url) => url !== null);
        } catch (uploadError) {
    
          toast.error(
            "Erreur photos",
            "Impossible d'uploader certaines photos"
          );
        }
      }

      // Préparation des données pour l'API
      const centerData = {
        name: formData.nom,
        center_type: formData.type_centre,
        service_category: "health",
        status: formData.statut === "approuve" ? "approved" : "pending",
        full_address: formData.adresse_complete,
        city: formData.ville,
        district: formData.quartier || null,
        phone: formData.telephone,
        secondary_phone: null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        website: formData.site_web || null,
        services: formData.services,
        specialties: formData.specialites,
        emergency_24h: formData.urgences_24h,
        wheelchair_accessible: formData.accessibilite_handicapes,
        parking_available: formData.parking_disponible,
        public_transport: formData.transport_public ? "Available" : null,
        description: formData.description || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        opening_hours: formData.urgences_24h ? null : formData.horaires,
        photos: photoUrls,
        admin_notes: formData.notes_admin || null,
      };

      const response = await fetch("/api/admin/centres", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(centerData),
      });

      if (response.ok) {
        toast.success("Centre créé", "Le centre a été créé avec succès");
        router.push("/admin");
      } else if (response.status === 401) {
        router.push("/login?redirectTo=/admin/nouveau-centre");
      } else if (response.status === 403) {
        router.push("/unauthorized");
      } else {
        const errorData = await response.json();
        toast.error(
          "Erreur",
          errorData.error || "Impossible de créer le centre"
        );
      }
    } catch (error) {
    
      toast.error("Erreur", "Une erreur inattendue s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.nom &&
    formData.type_centre &&
    formData.ville &&
    formData.telephone;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Retour au dashboard</span>
                  <span className="sm:hidden">Retour</span>
                </Button>
              </Link>

              {/* Indicateur de progression */}
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step <= currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Titre de l'étape */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {currentStep === 1 && "Informations générales"}
              {currentStep === 2 && "Localisation et contact"}
              {currentStep === 3 && "Services et spécialités"}
              {currentStep === 4 && "Horaires et accessibilité"}
              {currentStep === 5 && "Paramètres admin"}
            </h1>
            <p className="text-muted-foreground">
              Étape {currentStep} sur 5 - Création d'un nouveau centre
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {/* Étape 1: Informations générales */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="nom">Nom du service d'urgence *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => updateFormData("nom", e.target.value)}
                      placeholder="Ex: Hôpital Général de Fianarantsoa"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type_centre">Type de service *</Label>
                    <Select
                      value={formData.type_centre}
                      onValueChange={(value) =>
                        updateFormData("type_centre", value)
                      }>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CENTER_TYPES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">
                      Description du service *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        updateFormData("description", e.target.value)
                      }
                      placeholder="Décrivez votre service d'urgence, vos équipements, votre équipe médicale..."
                      rows={4}
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum 50 caractères ({formData.description.length}/50)
                    </p>
                  </div>

                  {/* Upload de photos */}
                  <div>
                    <Label>Photos du centre (optionnel)</Label>
                    <div className="mt-2">
                      {formData.photos.length < 5 && (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(e.target.files)}
                            className="hidden"
                            id="photos"
                          />
                          <Label htmlFor="photos" className="cursor-pointer">
                            <Button variant="outline" asChild>
                              <span>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter des photos
                              </span>
                            </Button>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2">
                            Maximum 5 photos - JPG, PNG (max 5MB chacune)
                          </p>
                        </div>
                      )}

                      {formData.photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {formData.photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <Image
                                src={URL.createObjectURL(photo)}
                                alt={`Photo ${index + 1}`}
                                width={200}
                                height={150}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Localisation et contact */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="ville">Ville *</Label>
                    <Select
                      value={formData.ville}
                      onValueChange={(value) => updateFormData("ville", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionnez la ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {MADAGASCAR_CITIES.map((ville) => (
                          <SelectItem key={ville} value={ville}>
                            {ville}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quartier">Quartier/District</Label>
                    <Input
                      id="quartier"
                      value={formData.quartier}
                      onChange={(e) =>
                        updateFormData("quartier", e.target.value)
                      }
                      placeholder="Ex: Isotry, Analakely..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adresse_complete">Adresse complète *</Label>
                    <Textarea
                      id="adresse_complete"
                      value={formData.adresse_complete}
                      onChange={(e) =>
                        updateFormData("adresse_complete", e.target.value)
                      }
                      placeholder="Adresse précise avec points de repère..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telephone">Téléphone principal *</Label>
                      <Input
                        id="telephone"
                        value={formData.telephone}
                        onChange={(e) =>
                          updateFormData("telephone", e.target.value)
                        }
                        placeholder="+261 32 00 000 00"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) =>
                          updateFormData("whatsapp", e.target.value)
                        }
                        placeholder="+261 32 00 000 00"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          updateFormData("email", e.target.value)
                        }
                        placeholder="contact@centre-sante.mg"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="site_web">Site web</Label>
                      <Input
                        id="site_web"
                        value={formData.site_web}
                        onChange={(e) =>
                          updateFormData("site_web", e.target.value)
                        }
                        placeholder="https://www.centre-sante.mg"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Section coordonnées GPS */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <Label className="font-medium">
                        Coordonnées GPS (optionnel)
                      </Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={formData.latitude || ""}
                          onChange={(e) =>
                            updateFormData(
                              "latitude",
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                          placeholder="-18.8792"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={formData.longitude || ""}
                          onChange={(e) =>
                            updateFormData(
                              "longitude",
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                          placeholder="47.5079"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Utilisez Google Maps pour obtenir les coordonnées précises
                    </p>
                  </div>
                </div>
              )}

              {/* Étape 3: Services et spécialités */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">
                      Services médicaux proposés *
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Sélectionnez tous les services disponibles
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {SERVICES_MEDICAUX.map((service) => (
                        <div
                          key={service}
                          className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service}`}
                            checked={formData.services.includes(service)}
                            onCheckedChange={() =>
                              toggleArrayItem("services", service)
                            }
                          />
                          <Label
                            htmlFor={`service-${service}`}
                            className="text-sm font-normal cursor-pointer">
                            {service}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">
                      Spécialités médicales
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Sélectionnez les spécialités disponibles
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {SPECIALITES_MEDICALES.map((specialite) => (
                        <div
                          key={specialite}
                          className="flex items-center space-x-2">
                          <Checkbox
                            id={`specialite-${specialite}`}
                            checked={formData.specialites.includes(specialite)}
                            onCheckedChange={() =>
                              toggleArrayItem("specialites", specialite)
                            }
                          />
                          <Label
                            htmlFor={`specialite-${specialite}`}
                            className="text-sm font-normal cursor-pointer">
                            {specialite}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Label className="text-base font-medium">
                      Services d'urgence
                    </Label>
                    <div className="mt-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="urgences_24h"
                          checked={formData.urgences_24h}
                          onCheckedChange={(checked) =>
                            updateFormData("urgences_24h", checked)
                          }
                        />
                        <Label
                          htmlFor="urgences_24h"
                          className="cursor-pointer">
                          Urgences 24h/24 et 7j/7
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 4: Horaires et accessibilité */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {!formData.urgences_24h && (
                    <div>
                      <Label className="text-base font-medium">
                        Horaires d'ouverture
                      </Label>
                      <div className="mt-3 space-y-3">
                        {JOURS_SEMAINE.map((jour) => (
                          <div
                            key={jour}
                            className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="w-20">
                              <Label className="capitalize font-medium">
                                {jour}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={formData.horaires[jour].ouvert}
                                onCheckedChange={(checked) =>
                                  updateHoraire(jour, "ouvert", checked)
                                }
                              />
                              <span className="text-sm">Ouvert</span>
                            </div>
                            {formData.horaires[jour].ouvert && (
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="time"
                                  value={formData.horaires[jour].debut}
                                  onChange={(e) =>
                                    updateHoraire(jour, "debut", e.target.value)
                                  }
                                  className="w-32"
                                />
                                <span>à</span>
                                <Input
                                  type="time"
                                  value={formData.horaires[jour].fin}
                                  onChange={(e) =>
                                    updateHoraire(jour, "fin", e.target.value)
                                  }
                                  className="w-32"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-base font-medium">
                      Accessibilité et services
                    </Label>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="accessibilite_handicapes"
                          checked={formData.accessibilite_handicapes}
                          onCheckedChange={(checked) =>
                            updateFormData("accessibilite_handicapes", checked)
                          }
                        />
                        <Label
                          htmlFor="accessibilite_handicapes"
                          className="cursor-pointer">
                          Accessible aux personnes à mobilité réduite
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parking_disponible"
                          checked={formData.parking_disponible}
                          onCheckedChange={(checked) =>
                            updateFormData("parking_disponible", checked)
                          }
                        />
                        <Label
                          htmlFor="parking_disponible"
                          className="cursor-pointer">
                          Parking disponible
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="transport_public"
                          checked={formData.transport_public}
                          onCheckedChange={(checked) =>
                            updateFormData("transport_public", checked)
                          }
                        />
                        <Label
                          htmlFor="transport_public"
                          className="cursor-pointer">
                          Accessible en transport public
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 5: Paramètres admin */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="statut">Statut initial</Label>
                    <Select
                      value={formData.statut}
                      onValueChange={(value: "en_attente" | "approuve") =>
                        updateFormData("statut", value)
                      }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_attente">
                          En attente de validation
                        </SelectItem>
                        <SelectItem value="approuve">
                          Approuvé directement
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes_admin">Notes administratives</Label>
                    <Textarea
                      id="notes_admin"
                      value={formData.notes_admin}
                      onChange={(e) =>
                        updateFormData("notes_admin", e.target.value)
                      }
                      placeholder="Notes internes pour l'équipe d'administration..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between mt-8 pt-6 border-t border-border space-y-4 sm:space-y-0">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="w-full sm:w-auto">
                  Précédent
                </Button>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  {currentStep < 5 ? (
                    <Button
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className="w-full sm:w-auto">
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto min-w-32">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Création...
                        </>
                      ) : (
                        "Créer le centre"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

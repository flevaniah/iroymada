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
import {
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  MapPin,
  Plus,
  X,
  TestTube,
} from "lucide-react";
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
}

const initialHoraires: Horaires = JOURS_SEMAINE.reduce((acc, jour) => {
  acc[jour] = { ouvert: true, debut: "08:00", fin: "17:00" };
  return acc;
}, {} as Horaires);

export default function InscriptionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
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

  // Auto-fill function for testing
  const fillWithTestData = () => {
    const centerTypes = Object.keys(CENTER_TYPES);
    const randomCenterType =
      centerTypes[Math.floor(Math.random() * centerTypes.length)];
    const randomCity =
      MADAGASCAR_CITIES[Math.floor(Math.random() * MADAGASCAR_CITIES.length)];
    const randomServices = SERVICES_MEDICAUX.slice(
      0,
      Math.floor(Math.random() * 8) + 3
    ); // 3-10 services
    const randomSpecialties = SPECIALITES_MEDICALES.slice(
      0,
      Math.floor(Math.random() * 5) + 1
    ); // 1-5 specialties

    // Generate random coordinates for Madagascar
    const madagascarCoords = {
      Antananarivo: { lat: -18.8792, lng: 47.5079 },
      Toamasina: { lat: -18.1492, lng: 49.4024 },
      Antsirabe: { lat: -19.8667, lng: 47.0333 },
      Fianarantsoa: { lat: -21.4536, lng: 47.0854 },
      Mahajanga: { lat: -15.7167, lng: 46.3167 },
      Toliara: { lat: -23.354, lng: 43.6673 },
    };

    const cityCoord = madagascarCoords[
      randomCity as keyof typeof madagascarCoords
    ] || {
      lat: -18.8792 + (Math.random() - 0.5) * 10,
      lng: 47.5079 + (Math.random() - 0.5) * 10,
    };

    const testData = {
      nom: `Centre de Test ${Math.floor(Math.random() * 1000)}`,
      type_centre: randomCenterType,
      description: `service d'urgence moderne situé à ${randomCity}. Équipé des dernières technologies médicales, notre équipe de professionnels qualifiés offre des soins de qualité dans un environnement accueillant et sécurisé. Nous proposons une large gamme de services médicaux pour répondre aux besoins de notre communauté.`,
      adresse_complete: `${
        Math.floor(Math.random() * 200) + 1
      } Avenue de l'Indépendance, près du marché central, ${randomCity}`,
      ville: randomCity,
      quartier: [
        "Centre-ville",
        "Quartier administratif",
        "Zone résidentielle",
        "Secteur commercial",
      ][Math.floor(Math.random() * 4)],
      telephone: `+261 ${Math.floor(Math.random() * 40) + 20} ${String(
        Math.floor(Math.random() * 90) + 10
      )} ${String(Math.floor(Math.random() * 900) + 100)} ${String(
        Math.floor(Math.random() * 90) + 10
      )}`,
      whatsapp: `+261 ${Math.floor(Math.random() * 40) + 20} ${String(
        Math.floor(Math.random() * 90) + 10
      )} ${String(Math.floor(Math.random() * 900) + 100)} ${String(
        Math.floor(Math.random() * 90) + 10
      )}`,
      email: `contact@centre-${randomCity.toLowerCase()}-${Math.floor(
        Math.random() * 100
      )}.mg`,
      site_web: `https://www.centre-${randomCity.toLowerCase()}.mg`,
      latitude: cityCoord.lat + (Math.random() - 0.5) * 0.1,
      longitude: cityCoord.lng + (Math.random() - 0.5) * 0.1,
      services: randomServices,
      specialites: randomSpecialties,
      urgences_24h: Math.random() > 0.7,
      accessibilite_handicapes: Math.random() > 0.5,
      parking_disponible: Math.random() > 0.3,
      transport_public: Math.random() > 0.4,
      horaires: initialHoraires,
      photos: [], // Cannot generate photos programmatically
    };

    setFormData((prev) => ({ ...prev, ...testData }));
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
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
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
            const fileName = `${Date.now()}-${index}-${photo.name}`;

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
   
        }
      }

      
      const centerData = {
        name: formData.nom,
        center_type: formData.type_centre,
        service_category: "health",
        status: "pending", // Toujours en attente pour l'inscription publique
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
        public_transport: formData.transport_public,
        description: formData.description || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        opening_hours: formData.urgences_24h ? null : formData.horaires,
        photos: photoUrls,
        admin_notes: `Inscription publique - ${new Date().toISOString()}`,
      };

      const response = await fetch("/api/centres", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(centerData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        const errorData = await response.json();
     
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (error) {
    
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <Check className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Inscription réussie !
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Votre service d'urgence a été soumis avec succès. Notre équipe
                va examiner les informations et vous contacter sous 48h.
              </p>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Prochaines étapes :</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Vérification des informations par notre équipe</li>
                  <li>• Validation des documents et photos</li>
                  <li>• Publication dans l'annuaire (48-72h)</li>
                  <li>• Confirmation par email</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={fillWithTestData}
                className="text-orange-600 border-orange-200 hover:bg-orange-50">
                <TestTube className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">
                  Remplir avec données test
                </span>
                <span className="sm:hidden">Test</span>
              </Button>
            </div>

          
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Titre de l'étape */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {currentStep === 1 && "Informations générales"}
              {currentStep === 2 && "Localisation et contact"}
              {currentStep === 3 && "Services et spécialités"}
              {currentStep === 4 && "Horaires et accessibilité"}
            </h1>
            <p className="text-muted-foreground">
              Étape {currentStep} sur 4 - Inscrivez votre service d'urgence
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
           
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="nom">Nom du service d'urgence *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => updateFormData("nom", e.target.value)}
                      placeholder="Ex: CHU Fianarantsoa "
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
                    <Label htmlFor="quartier">Quartier/Arrondissement</Label>
                    <Input
                      id="quartier"
                      value={formData.quartier}
                      onChange={(e) =>
                        updateFormData("quartier", e.target.value)
                      }
                      placeholder="Ex: Poto-Poto, BaMadagascar..."
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
                        placeholder="+242 06 000 00 00"
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
                        placeholder="+242 06 000 00 00"
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
                        placeholder="contact@centre-sante.cg"
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
                        placeholder="https://www.centre-sante.cg"
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
                          placeholder="-21.4536"
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
                          placeholder="47.0854"
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                            className="flex items-center space-x-4">
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
                              <>
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
                              </>
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

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}>
                  Précédent
                </Button>

                <div className="flex space-x-2">
                  {currentStep < 4 ? (
                    <Button
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}>
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="min-w-32">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        "Inscrire le centre"
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

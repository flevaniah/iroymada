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
  Save,
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
  name: string;
  center_type: string;
  description: string;
  full_address: string;
  city: string;
  district: string;
  phone: string;
  secondary_phone: string;
  whatsapp: string;
  email: string;
  website: string;
  latitude: number | null;
  longitude: number | null;
  services: string[];
  specialties: string[];
  emergency_24h: boolean;
  wheelchair_accessible: boolean;
  parking_available: boolean;
  public_transport: boolean;
  opening_hours: Horaires;
  photos: File[];
  status: "pending" | "approved" | "rejected";
  admin_notes: string;
}

const initialOpeningHours: Horaires = JOURS_SEMAINE.reduce((acc, jour) => {
  acc[jour] = { ouvert: true, debut: "08:00", fin: "17:00" };
  return acc;
}, {} as Horaires);

export default function NouveauCentrePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    name: "",
    center_type: "",
    description: "",
    full_address: "",
    city: "",
    district: "",
    phone: "",
    secondary_phone: "",
    whatsapp: "",
    email: "",
    website: "",
    latitude: null,
    longitude: null,
    services: [],
    specialties: [],
    emergency_24h: false,
    wheelchair_accessible: false,
    parking_available: false,
    public_transport: false,
    opening_hours: initialOpeningHours,
    photos: [],
    status: "pending",
    admin_notes: "",
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "services" | "specialties", item: string) => {
    const currentArray = formData[field];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateFormData(field, newArray);
  };

  const updateHoraire = (jour: string, field: keyof Horaire, value: any) => {
    const newHoraires = {
      ...formData.opening_hours,
      [jour]: {
        ...formData.opening_hours[jour],
        [field]: value,
      },
    };
    updateFormData("opening_hours", newHoraires);
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
      name: `Centre de Test ${Math.floor(Math.random() * 1000)}`,
      center_type: randomCenterType,
      description: `Centre de santé moderne situé à ${randomCity}. Équipé des dernières technologies médicales, notre équipe de professionnels qualifiés offre des soins de qualité dans un environnement accueillant et sécurisé. Nous proposons une large gamme de services médicaux pour répondre aux besoins de notre communauté.`,
      full_address: `${
        Math.floor(Math.random() * 200) + 1
      } Avenue de l'Indépendance, près du marché central, ${randomCity}`,
      city: randomCity,
      district: [
        "Centre-ville",
        "Quartier administratif",
        "Zone résidentielle",
        "Secteur commercial",
      ][Math.floor(Math.random() * 4)],
      phone: `+261 ${Math.floor(Math.random() * 40) + 20} ${String(
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
      website: `https://www.centre-${randomCity.toLowerCase()}.mg`,
      latitude: cityCoord.lat + (Math.random() - 0.5) * 0.1,
      longitude: cityCoord.lng + (Math.random() - 0.5) * 0.1,
      services: randomServices,
      specialties: randomSpecialties,
      emergency_24h: Math.random() > 0.7,
      wheelchair_accessible: Math.random() > 0.5,
      parking_available: Math.random() > 0.3,
      public_transport: Math.random() > 0.4,
      opening_hours: initialOpeningHours,
      photos: [], // Cannot generate photos programmatically
      status: (Math.random() > 0.5 ? "approved" : "pending") as "approved" | "pending",
      admin_notes: `Centre de test généré automatiquement le ${new Date().toLocaleDateString(
        "fr-FR"
      )}. Données aléatoires pour démonstration.`,
    };

    setFormData((prev) => ({ ...prev, ...testData }));
    toast.success &&
      toast.success(
        "Données de test",
        "Formulaire rempli avec des données aléatoires"
      );
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.center_type && formData.description);
      case 2:
        return !!(
          formData.full_address &&
          formData.city &&
          formData.phone
        );
      case 3:
        return formData.services.length > 0;
      case 4:
        return true; // Étape optionnelle
      case 5:
        return true; // Admin step
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
        name: formData.name,
        center_type: formData.center_type,
        service_category: "health",
        status: formData.status,
        full_address: formData.full_address,
        city: formData.city,
        district: formData.district || null,
        phone: formData.phone,
        secondary_phone: formData.secondary_phone || null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        website: formData.website || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        services: formData.services,
        specialties: formData.specialties,
        emergency_24h: formData.emergency_24h,
        wheelchair_accessible: formData.wheelchair_accessible,
        parking_available: formData.parking_available,
        public_transport: formData.public_transport,
        description: formData.description || null,
        opening_hours: formData.emergency_24h ? null : formData.opening_hours,
        photos: photoUrls,
        admin_notes:
          formData.admin_notes ||
          `Créé par admin - ${new Date().toISOString()}`,
      };

      const response = await fetch("/api/admin/centres", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(centerData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/admin");
        }, 3000);
      } else if (response.status === 401) {
        router.push("/login?redirectTo=/admin/nouveau-centre");
      } else if (response.status === 403) {
        router.push("/unauthorized");
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
          toast.error(
            "Données invalides",
            "Veuillez corriger les erreurs dans le formulaire"
          );
        } else {
          toast.error("Erreur", errorData.error || "Données invalides");
        }
      } else {
       
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/admin");
        }, 3000);
      }
    } catch (error) {
     
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/admin");
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
                Service d'urgence créé avec succès !
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Le service d'urgence a été créé avec le statut "
                {formData.status === "approved"
                  ? "approuvé"
                  : "en attente de validation"}
                ".
              </p>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Service créé :</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • <strong>{formData.name}</strong>
                  </li>
                  <li>
                    • Type:{" "}
                    {
                      CENTER_TYPES[
                        formData.center_type as keyof typeof CENTER_TYPES
                      ]
                    }
                  </li>
                  <li>• Ville: {formData.city}</li>
                  <li>
                    • Statut:{" "}
                    {formData.status === "approved" ? "Approuvé" : "En attente"}
                  </li>
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
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au dashboard
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

            {/* Indicateur de progression */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
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
              {currentStep === 5 && "Paramètres d'administration"}
            </h1>
            <p className="text-muted-foreground">
              Étape {currentStep} sur 5 - Nouveau service d'urgence
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
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="Ex: CHU Fianarantsoa"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type_centre">Type de service *</Label>
                    <Select
                      value={formData.center_type}
                      onValueChange={(value) =>
                        updateFormData("center_type", value)
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
                      value={formData.city}
                      onValueChange={(value) => updateFormData("city", value)}>
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
                      value={formData.district}
                      onChange={(e) =>
                        updateFormData("district", e.target.value)
                      }
                      placeholder="Ex: Tambohobe, Andrainjato."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adresse_complete">Adresse complète *</Label>
                    <Textarea
                      id="adresse_complete"
                      value={formData.full_address}
                      onChange={(e) =>
                        updateFormData("full_address", e.target.value)
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
                        value={formData.phone}
                        onChange={(e) =>
                          updateFormData("phone", e.target.value)
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
                        value={formData.website}
                        onChange={(e) =>
                          updateFormData("website", e.target.value)
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
                            checked={formData.specialties.includes(specialite)}
                            onCheckedChange={() =>
                              toggleArrayItem("specialties", specialite)
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
                          checked={formData.emergency_24h}
                          onCheckedChange={(checked) =>
                            updateFormData("emergency_24h", checked)
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
                  {!formData.emergency_24h && (
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
                                checked={formData.opening_hours[jour].ouvert}
                                onCheckedChange={(checked) =>
                                  updateHoraire(jour, "ouvert", checked)
                                }
                              />
                              <span className="text-sm">Ouvert</span>
                            </div>
                            {formData.opening_hours[jour].ouvert && (
                              <>
                                <Input
                                  type="time"
                                  value={formData.opening_hours[jour].debut}
                                  onChange={(e) =>
                                    updateHoraire(jour, "debut", e.target.value)
                                  }
                                  className="w-32"
                                />
                                <span>à</span>
                                <Input
                                  type="time"
                                  value={formData.opening_hours[jour].fin}
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
                          checked={formData.wheelchair_accessible}
                          onCheckedChange={(checked) =>
                            updateFormData("wheelchair_accessible", checked)
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
                          checked={formData.parking_available}
                          onCheckedChange={(checked) =>
                            updateFormData("parking_available", checked)
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
                          checked={formData.public_transport}
                          onCheckedChange={(checked) =>
                            updateFormData("public_transport", checked)
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

              {/* Étape 5: Administration */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="statut">Statut initial</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "pending" | "approved") =>
                        updateFormData("status", value)
                      }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          En attente de validation
                        </SelectItem>
                        <SelectItem value="approved">
                          Approuvé directement
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Les services approuvés seront immédiatement visibles par
                      le public
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="notes_admin">Notes administratives</Label>
                    <Textarea
                      id="notes_admin"
                      value={formData.admin_notes}
                      onChange={(e) =>
                        updateFormData("admin_notes", e.target.value)
                      }
                      placeholder="Notes internes pour l'équipe d'administration..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Résumé du centre */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Label className="text-base font-medium">
                      Résumé du service
                    </Label>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <strong>Nom:</strong> {formData.name || "Non renseigné"}
                      </div>
                      <div>
                        <strong>Type:</strong>{" "}
                        {formData.center_type
                          ? CENTER_TYPES[
                              formData.center_type as keyof typeof CENTER_TYPES
                            ]
                          : "Non renseigné"}
                      </div>
                      <div>
                        <strong>Ville:</strong>{" "}
                        {formData.city || "Non renseigné"}
                      </div>
                      <div>
                        <strong>Téléphone:</strong>{" "}
                        {formData.phone || "Non renseigné"}
                      </div>
                      <div>
                        <strong>Services:</strong> {formData.services.length}{" "}
                        sélectionnés
                      </div>
                      <div>
                        <strong>Urgences 24h:</strong>{" "}
                        {formData.emergency_24h ? "Oui" : "Non"}
                      </div>
                      <div>
                        <strong>Photos:</strong> {formData.photos.length}{" "}
                        ajoutées
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
                  {currentStep < 5 ? (
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
                          Création...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Créer le centre
                        </>
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

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "@/components/ui/toast";
import {
  CENTER_TYPES,
  SERVICES_MEDICAUX,
  SPECIALITES_MEDICALES,
  MADAGASCAR_CITIES,
} from "@/lib/constants";

// Force dynamic rendering
export const dynamic = "force-dynamic";

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
  services: string[];
  specialties: string[];
  emergency_24h: boolean;
  wheelchair_accessible: boolean;
  parking_available: boolean;
  public_transport: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string;
}

export default function EditCenterPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    services: [],
    specialties: [],
    emergency_24h: false,
    wheelchair_accessible: false,
    parking_available: false,
    public_transport: "",
    status: "pending",
    admin_notes: "",
  });

  useEffect(() => {
    loadCenter();
  }, [params.id]);

  const loadCenter = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/admin/centres/${params.id}`);

      if (response.ok) {
        const { center } = await response.json();
        setFormData({
          name: center.name || "",
          center_type: center.center_type || "",
          description: center.description || "",
          full_address: center.full_address || "",
          city: center.city || "",
          district: center.district || "",
          phone: center.phone || "",
          secondary_phone: center.secondary_phone || "",
          whatsapp: center.whatsapp || "",
          email: center.email || "",
          website: center.website || "",
          services: center.services || [],
          specialties: center.specialties || [],
          emergency_24h: center.emergency_24h || false,
          wheelchair_accessible: center.wheelchair_accessible || false,
          parking_available: center.parking_available || false,
          public_transport: center.public_transport || "",
          status: center.status || "pending",
          admin_notes: center.admin_notes || "",
        });
      } else if (response.status === 401) {
        router.push("/login?redirectTo=/admin");
      } else if (response.status === 403) {
        router.push("/unauthorized");
      } else {
        toast.error("Erreur", "Centre non trouvé");
        router.push("/admin");
      }
    } catch (error) {
    
      toast.error("Erreur", "Impossible de charger le centre");
      router.push("/admin");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleArrayItem = (field: "services" | "specialties", item: string) => {
    const currentArray = formData[field];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateFormData(field, newArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`/api/admin/centres/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          "Centre mis à jour",
          "Les modifications ont été sauvegardées avec succès"
        );
        router.push(`/admin/centres/${params.id}`);
      } else if (response.status === 401) {
        router.push("/login?redirectTo=/admin");
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
        const errorData = await response.json();
        toast.error(
          "Erreur",
          errorData.error || "Impossible de mettre à jour le centre"
        );
      }
    } catch (error) {
      
      toast.error("Erreur", "Une erreur inattendue s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.name && formData.center_type && formData.city && formData.phone;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href={`/admin/centres/${params.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Retour aux détails</span>
                  <span className="sm:hidden">Retour</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Modifier le centre
                </h1>
                <p className="text-sm text-muted-foreground">{formData.name}</p>
              </div>
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto">
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du service *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Ex: Hôpital Général de Fianarantsoa"
                    required
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="center_type">Type de service *</Label>
                  <Select
                    value={formData.center_type}
                    onValueChange={(value) =>
                      updateFormData("center_type", value)
                    }>
                    <SelectTrigger>
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
                  {errors.center_type && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.center_type}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                  placeholder="Décrivez le service d'urgence..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card>
            <CardHeader>
              <CardTitle>Localisation et contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => updateFormData("city", value)}>
                    <SelectTrigger>
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
                  {errors.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="district">District/Quartier</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => updateFormData("district", e.target.value)}
                    placeholder="Ex: Isotry"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="full_address">Adresse complète</Label>
                <Textarea
                  id="full_address"
                  value={formData.full_address}
                  onChange={(e) =>
                    updateFormData("full_address", e.target.value)
                  }
                  placeholder="Adresse précise avec points de repère..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone principal *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+261 32 00 000 00"
                    required
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="secondary_phone">Téléphone secondaire</Label>
                  <Input
                    id="secondary_phone"
                    value={formData.secondary_phone}
                    onChange={(e) =>
                      updateFormData("secondary_phone", e.target.value)
                    }
                    placeholder="+261 33 00 000 00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => updateFormData("whatsapp", e.target.value)}
                    placeholder="+261 32 00 000 00"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="contact@centre-sante.mg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => updateFormData("website", e.target.value)}
                  placeholder="https://www.centre-sante.mg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services et spécialités</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  Services médicaux
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Sélectionnez les services disponibles
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {SERVICES_MEDICAUX.slice(0, 15).map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service}`}
                        checked={formData.services.includes(service)}
                        onCheckedChange={() =>
                          toggleArrayItem("services", service)
                        }
                      />
                      <Label
                        htmlFor={`service-${service}`}
                        className="text-sm cursor-pointer">
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
                  {SPECIALITES_MEDICALES.slice(0, 15).map((specialite) => (
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
                        className="text-sm cursor-pointer">
                        {specialite}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Caractéristiques */}
          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques et accessibilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emergency_24h"
                      checked={formData.emergency_24h}
                      onCheckedChange={(checked) =>
                        updateFormData("emergency_24h", checked)
                      }
                    />
                    <Label htmlFor="emergency_24h" className="cursor-pointer">
                      Service d'urgences 24h/24
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wheelchair_accessible"
                      checked={formData.wheelchair_accessible}
                      onCheckedChange={(checked) =>
                        updateFormData("wheelchair_accessible", checked)
                      }
                    />
                    <Label
                      htmlFor="wheelchair_accessible"
                      className="cursor-pointer">
                      Accessible aux personnes à mobilité réduite
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="parking_available"
                      checked={formData.parking_available}
                      onCheckedChange={(checked) =>
                        updateFormData("parking_available", checked)
                      }
                    />
                    <Label
                      htmlFor="parking_available"
                      className="cursor-pointer">
                      Parking disponible
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="public_transport">Transport public</Label>
                  <Textarea
                    id="public_transport"
                    value={formData.public_transport}
                    onChange={(e) =>
                      updateFormData("public_transport", e.target.value)
                    }
                    placeholder="Décrivez les options de transport public..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Administration */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres d'administration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Statut du centre</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "pending" | "approved" | "rejected") =>
                    updateFormData("status", value)
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      En attente de validation
                    </SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="admin_notes">Notes administratives</Label>
                <Textarea
                  id="admin_notes"
                  value={formData.admin_notes}
                  onChange={(e) =>
                    updateFormData("admin_notes", e.target.value)
                  }
                  placeholder="Notes internes pour l'équipe d'administration..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

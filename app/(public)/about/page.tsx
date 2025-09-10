import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Heart, MapPin, Phone, Shield, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              À propos de l'Irôy
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Notre mission est de faciliter l'accès aux services d'urgences en
              fournissant des informations fiables et à jour pour une meilleure
              sécurité et tranquilité d'esprit.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  Notre Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Offrir une plateforme interactive et fiable qui localise les
                  services essentiels, améliore la réactivité en situation
                  d’urgence et renforce la sécurité des habitants de
                  Fianarantsoa.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Notre Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Irôy vise à améliorer l'accès aux services d'urgence pour les
                  populations vulnérables et à soutenir le développement urbain
                  durable. En utilisant des solutions de cartographie avancées,
                  ce projet identifie et comble les lacunes dans la couverture
                  des services d'urgence, assurant ainsi une meilleure sécurité
                  et qualité de vie.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Nos Valeurs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Les principes qui guident notre action quotidienne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fiabilité</h3>
              <p className="text-muted-foreground">
                Informations vérifiées et mises à jour régulièrement pour
                garantir leur exactitude.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accessibilité</h3>
              <p className="text-muted-foreground">
                Plateforme gratuite et accessible à tous, conçue pour être
                simple à utiliser.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rapidité</h3>
              <p className="text-muted-foreground">
                Trouver les services d'urgences en quelques clics, avec des
                informations pratiques instantanées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Notre Impact
            </h2>
            <p className="text-xl text-muted-foreground">En chiffres</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "150+", label: "Centres répertoriés" },
              { number: "15", label: "Villes couvertes" },
              { number: "45", label: "Services d'urgence" },
              { number: "100%", label: "Gratuit" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Contactez-nous
            </h2>
            <p className="text-muted-foreground mb-8">
              Une question, une suggestion ou souhaitez-vous ajouter votre
              centre de santé ?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 justify-center">
                <Phone className="h-5 w-5 text-primary" />
                <span>+261 34 08 379 79</span>
              </div>
              <div className="flex items-center space-x-3 justify-center">
                <Heart className="h-5 w-5 text-primary" />
                <span>contact@madatlas.net</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

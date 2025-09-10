import { Heart, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  services: [
    { name: "Rechercher un centre", href: "/recherche" },
    { name: "Soumettre un service", href: "/inscription" },
    { name: "Urgences 24/7", href: "/recherche?urgences_24h=true" },
  ],
  about: [
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Mentions légales", href: "/legal" },
    { name: "Confidentialité", href: "/privacy" },
  ],
  villes: [
    { name: "Fianarantsoa", href: "/recherche?city=Fianarantsoa" },
    { name: "Antananarivo", href: "/recherche?city=Antananarivo" },
    { name: "Antsirabe", href: "/recherche?city=Antsirabe" },
    { name: "Toutes les villes", href: "/recherche" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-2xl">
                <img
                  src="../../../../iroy.png"
                  alt="Logo"
                  width="50"
                  height="50"
                />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">Irôy</div>
                <div className="text-sm text-muted-foreground">
                  Votre guide des services d'urgence
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Retrouvez rapidement les services essentiels à Fianarantsoa et ses
              alentours. Des informations fiables, toujours à jour.
            </p>

            {/* Contact rapide */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@madatlas.net</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+261 34 08 379 79</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Université de Fianarantsoa</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Informations</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Villes */}
          {/* <div>
            <h3 className="font-semibold text-foreground mb-4">
              Villes populaires
            </h3>
            <ul className="space-y-2">
              {footerLinks.villes.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>© 2024 Iroy. Fait avec</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>pour les services d'urgences</span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Version 1.0</span>
              <span>•</span>
              <Link
                href="/sitemap"
                className="hover:text-foreground transition-colors">
                Plan du site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

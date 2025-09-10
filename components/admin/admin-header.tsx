"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Settings,
  LogOut,
  User,
  BarChart3,
  Plus,
  Home,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "@/components/ui/toast";

interface AdminHeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    // Load user profile
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile");
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
        }
      } catch (error) {
       
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        toast.success("Déconnexion", "Vous avez été déconnecté avec succès");
        router.push("/login");
      } else {
        toast.error("Erreur", "Impossible de se déconnecter");
      }
    } catch (error) {
    
      toast.error("Erreur", "Impossible de se déconnecter");
    }
  };

  const navigation = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/admin",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: TrendingUp,
      active: pathname === "/admin/analytics",
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo and branding */}
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className=" text-white p-2 rounded-lg">
                <img
                  src="../../../../iroy.png"
                  alt="Logo"
                  width="50"
                  height="50"
                />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg text-gray-900">
                  Admin Urgences
                </div>
                <div className="text-sm text-gray-600">Irôy Madagascar</div>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "default" : "ghost"}
                  size="sm"
                  className={item.active ? "bg-primary" : ""}>
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* User menu and mobile toggle */}
          <div className="flex items-center space-x-2">
            {/* Desktop user menu */}
            <div className="hidden sm:flex items-center space-x-2">
              {userProfile && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {userProfile.email}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {userProfile.role}
                  </div>
                </div>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" title="Voir le site public">
                  <Building2 className="h-4 w-4 mr-2" />
                  Site public
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden">
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Page title and actions */}
        {(title || actions) && (
          <div className="border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              {title && (
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      {description}
                    </p>
                  )}
                </div>
              )}
              {actions && (
                <div className="flex flex-col sm:flex-row gap-2">{actions}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {/* Navigation links */}
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    item.active ? "bg-primary" : ""
                  }`}
                  size="sm">
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}

            <hr className="my-2 border-gray-300" />

            {/* User info */}
            {userProfile && (
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-900">
                  {userProfile.email}
                </div>
                <div className="text-xs text-gray-600 capitalize">
                  {userProfile.role}
                </div>
              </div>
            )}

            {/* Actions */}
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Site public
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

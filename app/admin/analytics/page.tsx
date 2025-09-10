'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Search, 
  MousePointer,
  Calendar,
  RefreshCw,
  Activity,
  MapPin,
  Eye
} from 'lucide-react'
import { toast } from '@/components/ui/toast'

// Types pour les analytics dynamiques
interface ServiceStat {
  name: string;
  totalInteractions: number;
  searchCount: number;
  clickCount: number;
  filterCount: number;
  popularityScore: number;
}

interface InteractionStat {
  type: string;
  count: number;
  label: string;
}

interface DailyStat {
  date: string;
  interactions: number;
  searches: number;
}

interface SearchDetails {
  topSearchTerms: Array<{ term: string; count: number }>;
  topCenterTypes: Array<{ type: string; count: number }>;
  topServicesFiltered: Array<{ service: string; count: number }>;
}

// Types pour les rapports statiques
interface ReportsData {
  summary: {
    totalCenters: number
    approvedCenters: number
    pendingCenters: number
    rejectedCenters: number
    emergencyCenters: number
    accessibleCenters: number
    approvalRate: number
    accessibilityRate: number
  }
  distribution: {
    centersByType: Record<string, number>
    centersByCity: Record<string, number>
    topServices: Record<string, number>
    topSpecialties: Record<string, number>
  }
  trends: {
    monthlyGrowth: Record<string, number>
    mostViewed: Array<{
      id: string
      name: string
      city: string
      view_count: number
      center_type: string
    }>
    recentActivity: Array<{
      id: string
      name: string
      city: string
      status: string
      center_type: string
      updated_at: string
    }>
  }
  generatedAt: string
  period: {
    from: string
    to: string
  }
}

export default function AnalyticsReportsPage() {
  // États pour les analytics dynamiques
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [interactionStats, setInteractionStats] = useState<InteractionStat[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [searchDetails, setSearchDetails] = useState<SearchDetails>({
    topSearchTerms: [],
    topCenterTypes: [],
    topServicesFiltered: []
  });
  
  // États pour les rapports statiques
  const [reports, setReports] = useState<ReportsData | null>(null);
  
  // États généraux
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les analytics dynamiques
  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics?days=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setServiceStats(data.serviceStats || []);
      setInteractionStats(data.interactionStats || []);
      setDailyStats(data.dailyStats || []);
      setSearchDetails(data.searchDetails || { 
        topSearchTerms: [], 
        topCenterTypes: [], 
        topServicesFiltered: [] 
      });
    } catch (error) {
     
      setError(error instanceof Error ? error.message : 'Erreur de chargement des analytics');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Fonction pour charger les rapports statiques
  const loadReports = async () => {
    setIsLoadingReports(true);
    try {
      const response = await fetch('/api/admin/reports')
      if (response.ok) {
        const { reports: reportsData } = await response.json()
        setReports(reportsData)
      } else if (response.status === 401) {
        window.location.href = '/login?redirectTo=/admin/analytics'
      } else if (response.status === 403) {
        window.location.href = '/unauthorized'
      } else {
        toast.error('Erreur', 'Impossible de charger les rapports')
      }
    } catch (error) {
    
      toast.error('Erreur', 'Impossible de charger les rapports')
    } finally {
      setIsLoadingReports(false)
    }
  }

  // Charger les données au montage et quand le timeRange change
  useEffect(() => {
    loadAnalytics();
    loadReports();
  }, [timeRange]);

  // État général de chargement
  const isLoading = isLoadingAnalytics || isLoadingReports;


  // Calculer les métriques principales
  const totalInteractions = interactionStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalSearches = interactionStats.find(s => s.type === 'text_search')?.count || 0;
  const totalServiceClicks = interactionStats.filter(s => 
    ['service_click', 'popular_service_click'].includes(s.type)
  ).reduce((sum, stat) => sum + stat.count, 0);

  // États de chargement pour l'UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplifié */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics & Rapports</h1>
              <p className="text-muted-foreground text-sm">
                Données d'utilisation en temps réel et rapports détaillés
                {reports && (
                  <span className="ml-2">
                    • Généré le {new Date(reports.generatedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => { loadAnalytics(); loadReports(); }} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Métriques principales - Fusion analytics + rapports */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total centres</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports?.summary.totalCenters || 0}</div>
              <p className="text-xs text-muted-foreground">
                Taux d'approbation: {reports?.summary.approvalRate || 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interactions ({timeRange}j)</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Toutes interactions confondues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Centres 24h/24</CardTitle>
              <Activity className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{reports?.summary.emergencyCenters || 0}</div>
              <p className="text-xs text-muted-foreground">
                {reports?.summary.totalCenters ? Math.round(((reports?.summary.emergencyCenters || 0) / reports.summary.totalCenters) * 100) : 0}% du total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{reports?.summary.pendingCenters || 0}</div>
              <p className="text-xs text-muted-foreground">
                Nécessitent une validation
              </p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-800">
                <strong>Erreur:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top villes et services avec analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 des villes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports?.distribution.centersByCity ? (
                Object.entries(reports.distribution.centersByCity)
                  .slice(0, 10)
                  .map(([city, count]) => (
                    <div key={city} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{city}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée de répartition par ville
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services les plus proposés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports?.distribution.topServices ? (
                Object.entries(reports.distribution.topServices)
                  .slice(0, 10)
                  .map(([service, count]) => {
                    // Trouver les stats analytics pour ce service si disponible
                    const analyticsData = serviceStats.find(s => s.name.toLowerCase() === service.toLowerCase())
                    return (
                      <div key={service} className="flex items-center justify-between">
                        <span className="text-sm">{service}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{count}</span>
                          {analyticsData && (
                            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                              {Math.round(analyticsData.popularityScore)}pts
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune donnée de services disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Analytics détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Termes de recherche populaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Termes Recherchés ({timeRange}j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Chargement...</span>
                </div>
              ) : searchDetails.topSearchTerms.length > 0 ? (
                <div className="space-y-3">
                  {searchDetails.topSearchTerms.slice(0, 8).map((term, index) => (
                    <div key={term.term} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm">"{term.term}"</span>
                      </div>
                      <span className="font-bold text-sm">{term.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun terme de recherche
                </div>
              )}
            </CardContent>
          </Card>

          {/* Types de centres filtrés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Types Filtrés ({timeRange}j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Chargement...</span>
                </div>
              ) : searchDetails.topCenterTypes.length > 0 ? (
                <div className="space-y-3">
                  {searchDetails.topCenterTypes.slice(0, 8).map((centerType, index) => (
                    <div key={centerType.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-100 text-green-600 rounded text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm">{centerType.type}</span>
                      </div>
                      <span className="font-bold text-sm">{centerType.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun filtre de type
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services filtrés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Services Filtrés ({timeRange}j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Chargement...</span>
                </div>
              ) : searchDetails.topServicesFiltered.length > 0 ? (
                <div className="space-y-3">
                  {searchDetails.topServicesFiltered.slice(0, 8).map((service, index) => (
                    <div key={service.service} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm">{service.service}</span>
                      </div>
                      <span className="font-bold text-sm">{service.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun filtre de service
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Centres les plus consultés */}
        {reports?.trends.mostViewed && reports.trends.mostViewed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Centres les plus consultés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.trends.mostViewed.map((center, index) => (
                  <div key={center.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-bold text-primary">#{index + 1}</div>
                      <div>
                        <div className="font-medium">{center.name}</div>
                        <div className="text-sm text-muted-foreground">{center.city} • {center.center_type}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Eye className="h-4 w-4 mr-1" />
                      {center.view_count}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Activité récente */}
        {reports?.trends.recentActivity && reports.trends.recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activité récente (2 dernières semaines)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.trends.recentActivity.slice(0, 10).map((activity) => (
                  <div key={`${activity.id}-${activity.updated_at}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">{activity.city} • {activity.center_type}</div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {activity.status === 'approved' ? 'Approuvé' : 
                         activity.status === 'pending' ? 'En attente' : 'Rejeté'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.updated_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
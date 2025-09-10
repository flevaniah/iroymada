import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithAuth, verifyAdminPermissions } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const supabase = createServerClientWithAuth()

    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const status = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status })
    }


    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)


    const { data: interactions, error: interactionsError } = await supabase
      .from('service_interactions')
      .select('*')
      .gte('created_at', dateThreshold.toISOString())

    if (interactionsError) {
  
      return NextResponse.json(
        { error: 'Error fetching interactions' },
        { status: 500 }
      )
    }

   
    const serviceStatsMap: Record<string, {
      name: string;
      totalInteractions: number;
      searchCount: number;
      clickCount: number;
      filterCount: number;
      popularityScore: number;
    }> = {}

    interactions?.forEach((interaction: any) => {
      if (!interaction.service_name) return;

      const serviceName = interaction.service_name;
      if (!serviceStatsMap[serviceName]) {
        serviceStatsMap[serviceName] = {
          name: serviceName,
          totalInteractions: 0,
          searchCount: 0,
          clickCount: 0,
          filterCount: 0,
          popularityScore: 0
        };
      }

      const stats = serviceStatsMap[serviceName];
      stats.totalInteractions += 1;
      
      // Compter par type d'interaction
      switch (interaction.interaction_type) {
        case 'service_search':
        case 'text_search':
          stats.searchCount += 1;
          break;
        case 'service_click':
        case 'popular_service_click':
          stats.clickCount += 1;
          break;
        case 'service_filter':
          stats.filterCount += 1;
          break;
      }

      // Calculer le score de popularité avec pondération
      let weight = interaction.interaction_value || 1;
      switch (interaction.interaction_type) {
        case 'popular_service_click':
          weight *= 1.5;
          break;
        case 'service_filter':
          weight *= 2;
          break;
        case 'center_contact':
          weight *= 3;
          break;
      }
      
      stats.popularityScore += weight;
    });

    // Convertir en tableau et trier
    const serviceStats = Object.values(serviceStatsMap)
      .sort((a, b) => b.popularityScore - a.popularityScore);

    // Agréger les stats par type d'interaction
    const interactionTypesMap: Record<string, { type: string; count: number; label: string }> = {
      'service_search': { type: 'service_search', count: 0, label: 'Recherches de services' },
      'service_filter': { type: 'service_filter', count: 0, label: 'Filtres par service' },
      'service_click': { type: 'service_click', count: 0, label: 'Clics sur services' },
      'popular_service_click': { type: 'popular_service_click', count: 0, label: 'Clics services populaires' },
      'center_type_filter': { type: 'center_type_filter', count: 0, label: 'Filtres par type' },
      'emergency_filter': { type: 'emergency_filter', count: 0, label: 'Filtres urgences' },
      'accessibility_filter': { type: 'accessibility_filter', count: 0, label: 'Filtres accessibilité' },
      'text_search': { type: 'text_search', count: 0, label: 'Recherches textuelles' },
      'center_view': { type: 'center_view', count: 0, label: 'Vues de centres' },
      'center_contact': { type: 'center_contact', count: 0, label: 'Contacts de centres' }
    };

    interactions?.forEach((interaction: any) => {
      const type = interaction.interaction_type;
      if (interactionTypesMap[type]) {
        interactionTypesMap[type].count += 1;
      }
    });

    const interactionStats = Object.values(interactionTypesMap)
      .filter(stat => stat.count > 0)
      .sort((a, b) => b.count - a.count);

    // Analyser les termes de recherche populaires
    const searchTermsMap: Record<string, number> = {};
    const centerTypesMap: Record<string, number> = {};
    const servicesFilterMap: Record<string, number> = {};

    interactions?.forEach((interaction: any) => {
      // Termes de recherche
      if (interaction.search_term && interaction.search_term.trim()) {
        const term = interaction.search_term.toLowerCase().trim();
        searchTermsMap[term] = (searchTermsMap[term] || 0) + 1;
      }

      // Types de centres filtrés
      if (interaction.center_type && interaction.interaction_type === 'center_type_filter') {
        centerTypesMap[interaction.center_type] = (centerTypesMap[interaction.center_type] || 0) + 1;
      }

      // Services filtrés
      if (interaction.service_name && interaction.interaction_type === 'service_filter') {
        servicesFilterMap[interaction.service_name] = (servicesFilterMap[interaction.service_name] || 0) + 1;
      }
    });

    // Top 10 pour chaque catégorie
    const topSearchTerms = Object.entries(searchTermsMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));

    const topCenterTypes = Object.entries(centerTypesMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    const topServicesFiltered = Object.entries(servicesFilterMap)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([service, count]) => ({ service, count }));

    // Agréger par jour pour le graphique
    const dailyStatsMap: Record<string, { date: string; interactions: number; searches: number }> = {};

    interactions?.forEach((interaction: any) => {
      const date = interaction.created_at.split('T')[0]; // YYYY-MM-DD
      if (!dailyStatsMap[date]) {
        dailyStatsMap[date] = {
          date,
          interactions: 0,
          searches: 0
        };
      }

      dailyStatsMap[date].interactions += 1;
      
      if (['text_search', 'service_search'].includes(interaction.interaction_type)) {
        dailyStatsMap[date].searches += 1;
      }
    });

    // Remplir les jours manquants avec des zéros
    const dailyStats: Array<{ date: string; interactions: number; searches: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyStats.push(dailyStatsMap[dateStr] || {
        date: dateStr,
        interactions: 0,
        searches: 0
      });
    }

    return NextResponse.json({
      serviceStats,
      interactionStats,
      dailyStats,
      searchDetails: {
        topSearchTerms,
        topCenterTypes,
        topServicesFiltered
      },
      summary: {
        totalInteractions: interactions?.length || 0,
        uniqueServices: serviceStats.length,
        uniqueSearchTerms: topSearchTerms.length,
        uniqueCenterTypes: topCenterTypes.length,
        dateRange: {
          from: dateThreshold.toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
          days
        }
      }
    });

  } catch (error) {
 
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
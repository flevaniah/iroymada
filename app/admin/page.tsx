'use client'

import { useEffect, useState } from 'react'
import { authManager } from '@/lib/auth-manager'
import { 
  Users, 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CENTER_TYPES, MADAGASCAR_CITIES } from '@/lib/constants'
import { toast } from '@/components/ui/toast'
import { useConfirmationModal } from '@/components/ui/confirmation-modal'
import { useRouter } from 'next/navigation'

interface Centre {
  id: string
  name: string
  city: string
  center_type: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  phone?: string
  email?: string
}

interface Stats {
  total_centres: number
  centres_approuves: number
  centres_en_attente: number
  centres_rejetes: number
  nouveaux_cette_semaine: number
}

export default function AdminPage() {
  const router = useRouter()
  const [centres, setCentres] = useState<Centre[]>([])
  const [stats, setStats] = useState<Stats>({
    total_centres: 0,
    centres_approuves: 0,
    centres_en_attente: 0,
    centres_rejetes: 0,
    nouveaux_cette_semaine: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('') // Séparé pour l'input utilisateur
  const [statusFilter, setStatusFilter] = useState('all')
  const [villeFilter, setVilleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCenters, setTotalCenters] = useState(0)
  const [selectedCentres, setSelectedCentres] = useState<string[]>([])
  
  const { showConfirmation, ConfirmationModal } = useConfirmationModal()

  // Debounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput)
      setCurrentPage(1) // Reset à la page 1 quand on change la recherche
    }, 500) // Attendre 500ms avant de déclencher la recherche

    return () => clearTimeout(timeoutId)
  }, [searchInput])

  // Vérifier l'accès admin au chargement
  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await authManager?.checkAdminAccess() ?? false
      if (!hasAccess && typeof window !== 'undefined') {
        window.location.href = '/login?redirectTo=/admin'
      }
    }
    checkAccess()
  }, [])

  // Load real data from API
  useEffect(() => {
    loadData()
  }, [searchQuery, statusFilter, villeFilter, currentPage])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load statistics
      const statsResponse = await fetch('/api/admin/stats')
      if (statsResponse.ok) {
        const { stats: adminStats } = await statsResponse.json()
        setStats(adminStats)
      }

      // Load centers with filters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (villeFilter && villeFilter !== 'all') params.append('city', villeFilter)

      const centersResponse = await fetch(`/api/admin/centres?${params}`)
      if (centersResponse.ok) {
        const { centers, pagination } = await centersResponse.json()
        setCentres(centers)
        setTotalPages(pagination.pages)
        setTotalCenters(pagination.total)
      } else if (centersResponse.status === 401) {
        
        window.location.href = '/login?redirectTo=/admin'
      } else if (centersResponse.status === 403) {
        
        window.location.href = '/unauthorized'
      }
    } catch (error) {
    
      toast.error('Erreur de chargement', 'Impossible de charger les données admin')
    } finally {
      setIsLoading(false)
    }
  }

  
  const filteredCentres = centres

  
  const handleFilterChange = (newPage: number = 1) => {
    setCurrentPage(newPage)
  }

  const handleStatusChange = async (centreId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/centres/${centreId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          previousStatus: centres.find(c => c.id === centreId)?.status
        }),
      })

      if (response.ok) {
        toast.success('Statut mis à jour', 'Le statut du centre a été mis à jour avec succès')
        loadData()
      } else {
        toast.error('Erreur', 'Impossible de mettre à jour le statut du centre')
      }
    } catch (error) {
      
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedCentres.length === 0) return
    
    try {
      const response = await fetch('/api/admin/centres/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          centerIds: selectedCentres
        }),
      })

      if (response.ok) {
        const { message } = await response.json()
        toast.success('Action réussie', message || `Centres ${action === 'approve' ? 'approuvés' : action === 'reject' ? 'rejetés' : 'supprimés'} avec succès`)
        setSelectedCentres([])
        loadData()
      } else {
        const errorData = await response.json()
        toast.error('Erreur', errorData.error || `Impossible de ${action === 'approve' ? 'approuver' : action === 'reject' ? 'rejeter' : 'supprimer'} les centres`)
      }
    } catch (error) {
      
      toast.error('Erreur', `Impossible de ${action === 'approve' ? 'approuver' : action === 'reject' ? 'rejeter' : 'supprimer'} les centres`)
    }
  }

  const handleEdit = (centreId: string) => {
    router.push(`/admin/centres/${centreId}/edit`)
  }

  const handleDelete = (centreId: string) => {
    const centre = centres.find(c => c.id === centreId)
    if (!centre) return

    showConfirmation({
      title: 'Supprimer le centre',
      message: `Êtes-vous sûr de vouloir supprimer "${centre.name}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/centres/${centreId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            toast.success('Centre supprimé', `Le centre "${centre.name}" a été supprimé avec succès`)
            loadData()
          } else {
            const errorData = await response.json()
            toast.error('Erreur de suppression', errorData.error || 'Impossible de supprimer le centre')
          }
        } catch (error) {
         
          toast.error('Erreur', 'Impossible de supprimer le centre')
        }
      }
    })
  }

  const handleBulkDelete = () => {
    if (selectedCentres.length === 0) return
    
    showConfirmation({
      title: 'Supprimer les centres',
      message: `Êtes-vous sûr de vouloir supprimer ${selectedCentres.length} centre(s) ? Cette action est irréversible.`,
      confirmText: 'Supprimer tout',
      variant: 'danger',
      onConfirm: () => handleBulkAction('delete')
    })
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams({ format })
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (villeFilter && villeFilter !== 'all') params.append('city', villeFilter)

      const response = await fetch(`/api/admin/export?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `services-urgence-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success('Export réussi', `Les données ont été exportées en format ${format.toUpperCase()}`)
      } else {
        const errorData = await response.json()
        toast.error('Erreur d\'export', errorData.error || 'Impossible d\'exporter les données')
      }
    } catch (error) {
    
      toast.error('Erreur d\'export', 'Une erreur inattendue s\'est produite')
    }
  }

  const getStatusBadge = (status: Centre['status']) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">Approuvé</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-medium">En attente</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">Rejeté</span>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  const headerActions = (
    <>
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto sm:rounded-r-none border-r-0 sm:border-r"
          onClick={() => handleExport('csv')}
        >
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto sm:rounded-l-none"
          onClick={() => handleExport('pdf')}
        >
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full sm:w-auto"
        onClick={() => router.push('/admin/analytics')}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Analytics</span>
        <span className="sm:hidden">Stats</span>
      </Button>
      <Link href="/admin/nouveau-centre" className="w-full sm:w-auto">
        <Button size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nouveau service</span>
          <span className="sm:hidden">Nouveau</span>
        </Button>
      </Link>
    </>
  )

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm mb-6">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Services d'Urgence</h1>
            <p className="text-gray-600">Gestion des services d'urgence du Madagascar</p>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            {headerActions}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total services</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_centres}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.centres_approuves}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.centres_en_attente}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.centres_rejetes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
              <Plus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.nouveaux_cette_semaine}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par nom ou ville..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                  }}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value)
                  setCurrentPage(1) // Reset à la page 1
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={villeFilter} onValueChange={(value) => {
                  setVilleFilter(value)
                  setCurrentPage(1) // Reset à la page 1
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {MADAGASCAR_CITIES.map((ville) => (
                      <SelectItem key={ville} value={ville}>{ville}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions en lot */}
            {selectedCentres.length > 0 && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedCentres.length} centre{selectedCentres.length > 1 ? 's' : ''} sélectionné{selectedCentres.length > 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  {(() => {
                    const selectedCentresList = centres.filter(c => selectedCentres.includes(c.id))
                    const hasNonApproved = selectedCentresList.some(c => c.status !== 'approved')
                    const hasNonRejected = selectedCentresList.some(c => c.status !== 'rejected')
                    
                    return (
                      <>
                        {hasNonApproved && (
                          <Button 
                            size="sm" 
                            onClick={() => handleBulkAction('approve')} 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            title="Approuver tous les centres sélectionnés non approuvés"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver ({selectedCentresList.filter(c => c.status !== 'approved').length})
                          </Button>
                        )}
                        {hasNonRejected && (
                          <Button 
                            size="sm" 
                            onClick={() => handleBulkAction('reject')} 
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            title="Rejeter tous les centres sélectionnés non rejetés"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter ({selectedCentresList.filter(c => c.status !== 'rejected').length})
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleBulkDelete()}
                          title="Supprimer définitivement tous les centres sélectionnés"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer ({selectedCentres.length})
                        </Button>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des centres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Services d'urgence ({filteredCentres.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCentres.length === filteredCentres.length && filteredCentres.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCentres(filteredCentres.map(c => c.id))
                          } else {
                            setSelectedCentres([])
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="p-3 text-left font-medium">Service</th>
                    <th className="p-3 text-left font-medium">Ville</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Statut</th>
                    <th className="p-3 text-left font-medium">Date création</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCentres.map((centre) => (
                    <tr key={centre.id} className="border-t border-border hover:bg-muted/20">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedCentres.includes(centre.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCentres([...selectedCentres, centre.id])
                            } else {
                              setSelectedCentres(selectedCentres.filter(id => id !== centre.id))
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{centre.name}</div>
                          {centre.email && (
                            <div className="text-sm text-muted-foreground">{centre.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                          {centre.city}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">
                          {CENTER_TYPES[centre.center_type as keyof typeof CENTER_TYPES] || centre.center_type}
                        </span>
                      </td>
                      <td className="p-3">
                        {getStatusBadge(centre.status)}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(centre.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end space-x-1 min-w-0">
                          <div className="hidden sm:flex items-center space-x-1">
                            <Button variant="ghost" size="sm" asChild title="Voir les détails">
                              <Link href={`/admin/centres/${centre.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Modifier"
                              onClick={() => handleEdit(centre.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            {/* Boutons d'action basés sur le statut */}
                            {centre.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleStatusChange(centre.id, 'approved')}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Approuver"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleStatusChange(centre.id, 'rejected')}
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  title="Rejeter"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {centre.status === 'approved' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleStatusChange(centre.id, 'rejected')}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                title="Rejeter"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {centre.status === 'rejected' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleStatusChange(centre.id, 'approved')}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Approuver"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Supprimer définitivement"
                              onClick={() => handleDelete(centre.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Version mobile */}
                          <div className="sm:hidden">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="p-1"
                              onClick={() => {
                                // Menu contextuel mobile (simplification pour maintenant)
                                const actions = []
                                actions.push(`Voir: /admin/centres/${centre.id}`)
                                if (centre.status === 'pending') {
                                  actions.push('Approuver', 'Rejeter')
                                } else if (centre.status === 'approved') {
                                  actions.push('Rejeter')
                                } else if (centre.status === 'rejected') {
                                  actions.push('Approuver')
                                }
                                actions.push('Supprimer')
                                toast.info('Actions disponibles', actions.join(', '))
                              }}
                            >
                              ⋮
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Affichage de <strong>{Math.min((currentPage - 1) * 10 + 1, totalCenters)}</strong> à{' '}
                    <strong>{Math.min(currentPage * 10, totalCenters)}</strong> sur{' '}
                    <strong>{totalCenters}</strong> services
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => handleFilterChange(currentPage - 1)}
                  >
                    Précédent
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, currentPage - 2) + i;
                      if (page > totalPages) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => handleFilterChange(currentPage + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {filteredCentres.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun service trouvé</h3>
                <p className="text-muted-foreground">
                  Aucun service d'urgence ne correspond aux critères de recherche.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal de confirmation */}
      <ConfirmationModal />
    </div>
  )
}
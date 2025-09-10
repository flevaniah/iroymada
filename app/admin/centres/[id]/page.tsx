'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react'
import Link from 'next/link'
import { useConfirmationModal } from '@/components/ui/confirmation-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageGallery } from '@/components/ui/image-gallery'
import { toast } from '@/components/ui/toast'

// Force dynamic rendering

interface Centre {
  id: string
  name: string
  center_type: string
  service_category: string
  status: 'pending' | 'approved' | 'rejected'
  full_address: string
  city: string
  district?: string
  region?: string
  phone?: string
  secondary_phone?: string
  whatsapp?: string
  email?: string
  website?: string
  services?: string[]
  specialties?: string[]
  opening_hours?: any
  emergency_24h: boolean
  wheelchair_accessible: boolean
  parking_available: boolean
  public_transport?: string
  photos?: string[]
  description?: string
  latitude?: number
  longitude?: number
  view_count: number
  created_at: string
  updated_at: string
  admin_notes?: string
  approved_by?: string
  approved_at?: string
}

export default function AdminCenterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [center, setCenter] = useState<Centre | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { showConfirmation, ConfirmationModal } = useConfirmationModal()

  useEffect(() => {
    loadCenter()
  }, [params.id])

  const loadCenter = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/centres/${params.id}`)
      
      if (response.ok) {
        const { center } = await response.json()
        setCenter(center)
      } else if (response.status === 401) {
        router.push('/login?redirectTo=/admin')
      } else if (response.status === 403) {
        router.push('/unauthorized')
      } else {
        setError('Centre non trouvé')
      }
    } catch (error) {
     
      setError('Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
    if (!center) return
    
    try {
      const response = await fetch(`/api/admin/centres/${center.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          previousStatus: center.status
        }),
      })

      if (response.ok) {
        toast.success('Statut mis à jour', `Centre ${newStatus === 'approved' ? 'approuvé' : 'rejeté'} avec succès`)
        loadCenter()
      } else {
        toast.error('Erreur', 'Impossible de mettre à jour le statut')
      }
    } catch (error) {
      
      toast.error('Erreur', 'Impossible de mettre à jour le statut')
    }
  }

  const handleDelete = () => {
    if (!center) return
    
    showConfirmation({
      title: 'Supprimer le centre',
      message: `Êtes-vous sûr de vouloir supprimer "${center.name}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/centres/${center.id}`, {
            method: 'DELETE'
          })

          if (response.ok) {
            toast.success('Centre supprimé', 'Le centre a été supprimé avec succès')
            router.push('/admin')
          } else {
            toast.error('Erreur', 'Impossible de supprimer le centre')
          }
        } catch (error) {
          
          toast.error('Erreur', 'Impossible de supprimer le centre')
        }
      }
    })
  }

  const getStatusBadge = (status: Centre['status']) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Approuvé</span>
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">En attente</span>
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Rejeté</span>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du centre...</p>
        </div>
      </div>
    )
  }

  if (error || !center) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Centre non trouvé</h1>
            <p className="text-muted-foreground mb-6">{error || 'Le centre demandé n\'existe pas.'}</p>
            <Button asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{center.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(center.status)}
                <span className="text-sm text-muted-foreground">
                  ID: {center.id}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Actions basées sur le statut */}
            {center.status === 'pending' && (
              <>
                <Button 
                  onClick={() => handleStatusChange('approved')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
                <Button 
                  onClick={() => handleStatusChange('rejected')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
              </>
            )}
            
            {center.status === 'approved' && (
              <Button 
                onClick={() => handleStatusChange('rejected')}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            )}
            
            {center.status === 'rejected' && (
              <Button 
                onClick={() => handleStatusChange('approved')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver
              </Button>
            )}
            
            <Button variant="outline" asChild>
              <Link href={`/admin/centres/${center.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            </Button>
            
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Type de centre</h3>
                  <p>{center.center_type}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Catégorie de service</h3>
                  <p>{center.service_category}</p>
                </div>
                
                {center.description && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                    <p>{center.description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Adresse</h3>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p>{center.full_address}</p>
                      <p className="text-sm text-muted-foreground">
                        {center.city}
                        {center.district && `, ${center.district}`}
                        {center.region && `, ${center.region}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            {center.photos && center.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos ({center.photos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageGallery 
                    images={center.photos} 
                    alt={center.name}
                  />
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {center.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{center.phone}</span>
                  </div>
                )}
                
                {center.secondary_phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{center.secondary_phone}</span>
                  </div>
                )}
                
                {center.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{center.email}</span>
                  </div>
                )}
                
                {center.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={center.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {center.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            {center.services && center.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {center.services.map((service, index) => (
                      <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Vues</p>
                  <p className="text-2xl font-bold">{center.view_count || 0}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Créé le</p>
                  <p>{new Date(center.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Mis à jour le</p>
                  <p>{new Date(center.updated_at).toLocaleDateString('fr-FR')}</p>
                </div>
                
                {center.approved_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Approuvé le</p>
                    <p>{new Date(center.approved_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Caractéristiques */}
            <Card>
              <CardHeader>
                <CardTitle>Caractéristiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Urgences 24h/24</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    center.emergency_24h ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {center.emergency_24h ? 'Oui' : 'Non'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Accessible PMR</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    center.wheelchair_accessible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {center.wheelchair_accessible ? 'Oui' : 'Non'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Parking</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    center.parking_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {center.parking_available ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Notes admin */}
            {center.admin_notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes administratives</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{center.admin_notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de confirmation */}
      <ConfirmationModal />
    </div>
  )
}
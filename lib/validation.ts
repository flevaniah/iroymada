import { z } from 'zod'
import { CenterType, ServiceCategory } from '@/types/database'

// Install zod first: npm install zod
export const centerValidationSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  center_type: z.enum([
    'public_hospital', 'private_hospital', 'private_clinic', 'health_center',
    'dispensary', 'maternity', 'specialized_center', 'laboratory',
    'pharmacy', 'medical_office', 'dialysis_center', 'fire_station',
    'fire_hydrant', 'police_station', 'gendarmerie', 'jirama_office',
    'red_cross', 'samu', 'ngo_medical', 'other'
  ] as const, 'Type de centre invalide'),
  service_category: z.enum(['health', 'fire_rescue', 'security', 'essential_services', 'other'] as const).optional().default('health'),
  status: z.enum(['pending', 'approved', 'rejected', 'suspended'] as const).optional().default('pending'),
  full_address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  district: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  phone: z.string().min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères').max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères'),
  secondary_phone: z.string().max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères').optional().nullable(),
  whatsapp: z.string().max(20, 'Le numéro WhatsApp ne peut pas dépasser 20 caractères').optional().nullable(),
  email: z.string().email('Email invalide').optional().nullable(),
  website: z.string().url('URL invalide').optional().nullable(),
  services: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  emergency_24h: z.boolean().default(false),
  wheelchair_accessible: z.boolean().default(false),
  parking_available: z.boolean().default(false),
  public_transport: z.boolean().default(false),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional().nullable(),
  photos: z.array(z.string().url()).default([]),
  logo_url: z.string().url('URL du logo invalide').optional().nullable(),
  admin_notes: z.string().max(500, 'Les notes admin ne peuvent pas dépasser 500 caractères').optional().nullable(),
})

export const updateCenterValidationSchema = centerValidationSchema.partial().extend({
  id: z.string().uuid('ID invalide')
})

export const bulkActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'delete'], 'Action invalide'),
  centerIds: z.array(z.string().uuid('ID de centre invalide')).min(1, 'Au moins un centre doit être sélectionné')
})

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  city: z.string().optional(),
  center_type: z.string().optional(),
  service_category: z.string().optional()
})

export type CenterValidation = z.infer<typeof centerValidationSchema>
export type UpdateCenterValidation = z.infer<typeof updateCenterValidationSchema>
export type BulkActionValidation = z.infer<typeof bulkActionSchema>
export type PaginationValidation = z.infer<typeof paginationSchema>
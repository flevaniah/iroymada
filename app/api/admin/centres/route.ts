import { NextRequest, NextResponse } from 'next/server'
import { createServerClientWithAuth, verifyAdminPermissions } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const city = searchParams.get('city') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = createServerClientWithAuth()

    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const status = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status })
    }

    // Build query
    let query = supabase
      .from('health_centers')
      .select(`
        id,
        name,
        center_type,
        service_category,
        status,
        full_address,
        city,
        district,
        phone,
        email,
        emergency_24h,
        wheelchair_accessible,
        created_at,
        updated_at,
        created_by,
        approved_by,
        approved_at,
        admin_notes,
        view_count
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,full_address.ilike.%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (city) {
      query = query.eq('city', city)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: centers, error, count } = await query

    if (error) {
     
      return NextResponse.json(
        { error: 'Error fetching centers' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      centers: centers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientWithAuth()

    // Verify admin permissions
    const { user, profile, error: authError } = await verifyAdminPermissions(supabase)
    if (authError) {
      const status = authError === 'Unauthorized' ? 401 : authError === 'Insufficient permissions' ? 403 : 500
      return NextResponse.json({ error: authError }, { status })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.center_type || !body.city || !body.phone || !body.full_address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Map form data to database schema
    const centerData = {
      name: body.name,
      center_type: body.center_type,
      service_category: body.service_category || 'health',
      status: body.status || 'approved', // Admin can approve directly
      full_address: body.full_address,
      city: body.city,
      district: body.district || null,
      postal_code: body.postal_code || null,
      region: body.region || 'Madagascar',
      phone: body.phone,
      secondary_phone: body.secondary_phone || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      website: body.website || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      services: body.services || [],
      specialties: body.specialties || [],
      opening_hours: body.opening_hours || null,
      emergency_24h: body.emergency_24h || false,
      wheelchair_accessible: body.wheelchair_accessible || false,
      parking_available: body.parking_available || false,
      public_transport: body.public_transport || false,
      photos: body.photos || null,
      logo_url: body.logo_url || null,
      description: body.description || null,
      view_count: 0,
      admin_notes: body.admin_notes || null,
      created_by: user.id,
      approved_by: body.status === 'approved' ? user.id : null,
      approved_at: body.status === 'approved' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: center, error } = await supabase
      .from('health_centers')
      .insert([centerData])
      .select()
      .single()

    if (error) {
  
      return NextResponse.json(
        { error: 'Error creating center' },
        { status: 500 }
      )
    }

    return NextResponse.json({ center }, { status: 201 })

  } catch (error) {
   
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
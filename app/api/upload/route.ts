import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Configuration for Supabase Storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with service role for storage operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Storage bucket name - to be created in Supabase dashboard
const STORAGE_BUCKET = 'health-centers-photos'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

 
    const finalFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`
    const filePath = `uploads/${finalFileName}`


    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET)
    
    if (!bucketExists) {

      const { error: bucketError } = await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 
      })
      
      if (bucketError && !bucketError.message.includes('already exists')) {
        
        return NextResponse.json(
          { error: 'Storage configuration error' },
          { status: 500 }
        )
      }
    }

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
     
      return NextResponse.json(
        { error: 'Upload failed', details: error.message },
        { status: 500 }
      )
    }

    
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return NextResponse.json({ 
      url: publicUrl,
      path: filePath,
      message: 'File uploaded successfully'
    })

  } catch (error) {
  
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


export async function GET() {
  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()
    
    if (error) {
      return NextResponse.json({ error: 'Failed to check buckets' }, { status: 500 })
    }
    
    const healthCentersBucket = buckets?.find(bucket => bucket.name === STORAGE_BUCKET)
    
    return NextResponse.json({
      bucket_exists: !!healthCentersBucket,
      bucket_name: STORAGE_BUCKET,
      bucket_info: healthCentersBucket || null,
      available_buckets: buckets?.map(b => b.name) || []
    })
    
  } catch (error) {
  
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
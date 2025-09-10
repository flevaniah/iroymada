#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {

  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updatePhotos() {
  try {
   
    const { data: centers, error: centersError } = await supabase
      .from('health_centers')
      .select('id, name, photos')
      .order('created_at', { ascending: true })
    
    if (centersError) {
   
      return
    }
    
   
    
    const { data: images, error: imagesError } = await supabase.storage
      .from('health-centers-photos')
      .list('uploads', { limit: 100 })
    
    if (imagesError) {
     
      return
    }
    

    const imageFiles = images.filter(file => 
      file.name && 
      file.metadata && 
      file.metadata.mimetype && 
      file.metadata.mimetype.startsWith('image/')
    )
    
 
    
    if (imageFiles.length === 0) {
     
      return
    }
    
   
    const imagesPerCenter = Math.max(1, Math.floor(imageFiles.length / centers.length))
    
    for (let i = 0; i < centers.length; i++) {
      const center = centers[i]
      const startIndex = i * imagesPerCenter
      const endIndex = i === centers.length - 1 ? imageFiles.length : (i + 1) * imagesPerCenter
      
      const centerImages = imageFiles.slice(startIndex, endIndex)
      
      if (centerImages.length === 0) continue
      
         const photoUrls = centerImages.map(img => {
        const filePath = `uploads/${img.name}`
        const { data } = supabase.storage
          .from('health-centers-photos')
          .getPublicUrl(filePath)
        
        return data.publicUrl
      })
      
      
      const { error: updateError } = await supabase
        .from('health_centers')
        .update({ photos: photoUrls })
        .eq('id', center.id)
      
      if (updateError) {
       
      } else {
        
        photoUrls.forEach((url, index) => {
          
        })
      }
    }
   
    
  } catch (error) {
   
  }
}

updatePhotos()
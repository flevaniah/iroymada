#!/usr/bin/env node

/**
 * Script pour créer automatiquement un utilisateur admin
 * Usage: node scripts/create-admin.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const ADMIN_EMAIL = 'admin@iroy.mg'
const ADMIN_PASSWORD = 'AdminIroy2024!'
const ADMIN_DATA = {
  first_name: 'Admin',
  last_name: 'Iroy',
  role: 'super_admin',
  preferred_city: 'Fianarantsoa',
  email_notifications: true
}

async function createAdminUser() {

  

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
   
    process.exit(1)
  }

  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
   
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, 
      user_metadata: {
        first_name: ADMIN_DATA.first_name,
        last_name: ADMIN_DATA.last_name
      }
    })

    if (authError) {
      if (authError.message.includes('User already registered')) {
        
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers.users.find(u => u.email === ADMIN_EMAIL)
        
        if (!existingUser) {
          throw new Error('Impossible de récupérer l\'utilisateur existant')
        }
        
        authData.user = existingUser
        
      } else {
        throw authError
      }
    } else {

    }


    
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: authData.user.id,
        ...ADMIN_DATA,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (profileError) {
      throw profileError
    }

    const { data: verification } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, role, preferred_city')
      .eq('id', authData.user.id)
      .single()

  

  } catch (error) {

    
    if (error.message.includes('relation "user_profiles" does not exist')) {
     
    }
    
    process.exit(1)
  }
}


if (require.main === module) {
  createAdminUser()
}

module.exports = { createAdminUser }
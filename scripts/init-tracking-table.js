// Script d'initialisation de la table service_interactions
// Usage: node scripts/init-tracking-table.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY 

if (!supabaseUrl || !supabaseServiceKey) {

  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTrackingTable() {
 

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS service_interactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
          'service_search', 'service_filter', 'service_click', 'popular_service_click',
          'center_type_filter', 'emergency_filter', 'accessibility_filter',
          'text_search', 'center_view', 'center_contact'
      )),
      service_name VARCHAR(255),
      center_type VARCHAR(50),
      center_id UUID REFERENCES health_centers(id),
      search_term VARCHAR(255),
      filter_values JSONB,
      page_url VARCHAR(500),
      referrer_url VARCHAR(500),
      session_id VARCHAR(255),
      user_id UUID REFERENCES auth.users(id),
      ip_address INET,
      user_agent TEXT,
      user_position GEOMETRY(POINT, 4326),
      result_count INTEGER,
      interaction_value INTEGER DEFAULT 1
    );
  `

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    if (error) throw error

  } catch (error) {
   
    return false
  }

  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_service_interactions_type ON service_interactions(interaction_type);',
    'CREATE INDEX IF NOT EXISTS idx_service_interactions_service ON service_interactions(service_name) WHERE service_name IS NOT NULL;',
    'CREATE INDEX IF NOT EXISTS idx_service_interactions_created_at ON service_interactions(created_at);'
  ]

  for (const indexSQL of indexes) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSQL })
      if (error) throw error
    } catch (error) {
     
    }
  }


  const rlsSQL = `
    ALTER TABLE service_interactions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Anyone can insert interactions" ON service_interactions;
    CREATE POLICY "Anyone can insert interactions" ON service_interactions
        FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Admin can read all interactions" ON service_interactions;
    CREATE POLICY "Admin can read all interactions" ON service_interactions
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE id = auth.uid()
                AND role IN ('admin', 'super_admin', 'moderator')
            )
        );
  `

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: rlsSQL })
    if (error) throw error
   
  } catch (error) {
   
    return false
  }

  return true
}

async function testTracking() {

  
  const testInteraction = {
    interaction_type: 'service_click',
    service_name: 'Test Service',
    session_id: 'test_session_' + Date.now(),
    interaction_value: 1
  }

  try {
    const { data, error } = await supabase
      .from('service_interactions')
      .insert([testInteraction])
      .select()

    if (error) throw error
    
  
    await supabase
      .from('service_interactions')
      .delete()
      .eq('id', data[0].id)
      
   
  } catch (error) {
   
    return false
  }

  return true
}


async function main() {
  

  const tableCreated = await createTrackingTable()
  if (!tableCreated) {
   
    process.exit(1)
  }

  const testPassed = await testTracking()
  if (!testPassed) {
    
    process.exit(1)
  }

  
}

main().catch(console.error)
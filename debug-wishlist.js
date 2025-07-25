import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dkqcgmwqugsvlobzekwo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcWNnbXdxdWdzdmxvYnpla3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTg5OTcsImV4cCI6MjA2NTkzNDk5N30.FwT2G_SE-YDgvl8MDRFvA4EcfeujCcTIS5AgouiCXtE'
)

async function debugWishlistCreation() {
  console.log('🔍 Debug vytvoření seznamu...')
  
  // 1. Přihlásit se
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'vondracek.ivan@gmail.com',
    password: 'navi2633'
  })
  
  if (authError) {
    console.log('❌ Auth error:', authError)
    return
  }
  
  console.log('✅ Přihlášen:', authData.user.email, 'ID:', authData.user.id)
  
  // 2. Zkontrolovat RLS policies
  console.log('🔍 Test RLS policies...')
  
  const { data: testSelect, error: selectError } = await supabase
    .from('wishlists')
    .select('*')
    .limit(1)
  
  if (selectError) {
    console.log('❌ SELECT error:', selectError)
  } else {
    console.log('✅ SELECT works, count:', testSelect.length)
  }
  
  // 3. Test INSERT s debug informacemi
  console.log('🔍 Test INSERT...')
  
  const insertData = {
    user_id: authData.user.id,
    title: 'Debug Test Seznam',
    description: 'Debug test',
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  console.log('📝 Vkládám data:', insertData)
  
  const { data: insertResult, error: insertError } = await supabase
    .from('wishlists')
    .insert(insertData)
    .select()
    .single()
  
  if (insertError) {
    console.log('❌ INSERT error:', insertError)
    console.log('Error details:', {
      code: insertError.code,
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint
    })
  } else {
    console.log('🎉 INSERT success:', insertResult)
    
    // Vyčistit
    await supabase.from('wishlists').delete().eq('id', insertResult.id)
    console.log('🧹 Vyčištěno')
  }
}

debugWishlistCreation()
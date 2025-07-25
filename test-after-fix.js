import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dkqcgmwqugsvlobzekwo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcWNnbXdxdWdzdmxvYnpla3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTg5OTcsImV4cCI6MjA2NTkzNDk5N30.FwT2G_SE-YDgvl8MDRFvA4EcfeujCcTIS5AgouiCXtE'
)

async function quickTest() {
  console.log('🚀 Rychlý test po opravě...')
  
  // Test přihlášení
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'vondracek.ivan@gmail.com',
    password: 'navi2633'
  })
  
  if (authError) {
    console.log('❌ Auth chyba:', authError.message)
    return
  }
  
  console.log('✅ Přihlášení OK, user ID:', authData.user.id)
  
  // Test vytvoření seznamu
  const { data: wishlistData, error: wishlistError } = await supabase
    .from('wishlists')
    .insert({
      user_id: authData.user.id,
      title: 'Test Seznam Po Opravě',
      description: 'Test po opravě databáze'
    })
    .select()
    .single()
  
  if (wishlistError) {
    console.log('❌ Wishlist chyba:', wishlistError.message)
    console.log('Detail:', wishlistError)
    return
  }
  
  console.log('🎉 Seznam vytvořen!', wishlistData.title)
  
  // Vyčistit test data
  await supabase.from('wishlists').delete().eq('id', wishlistData.id)
  console.log('🧹 Test data vyčištěna')
}

quickTest()
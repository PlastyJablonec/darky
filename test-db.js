import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dkqcgmwqugsvlobzekwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcWNnbXdxdWdzdmxvYnpla3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTg5OTcsImV4cCI6MjA2NTkzNDk5N30.FwT2G_SE-YDgvl8MDRFvA4EcfeujCcTIS5AgouiCXtE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testování databáze...')
  
  // Test připojení
  try {
    const { data, error } = await supabase.from('wishlists').select('count').limit(1)
    if (error) {
      console.log('❌ Chyba přístupu k tabulce wishlists:', error.message)
      return false
    }
    console.log('✅ Tabulka wishlists existuje')
  } catch (err) {
    console.log('❌ Databáze nedostupná:', err.message)
    return false
  }

  // Test gifts tabulky
  try {
    const { data, error } = await supabase.from('gifts').select('count').limit(1)
    if (error) {
      console.log('❌ Chyba přístupu k tabulce gifts:', error.message)
      return false
    }
    console.log('✅ Tabulka gifts existuje')
  } catch (err) {
    console.log('❌ Tabulka gifts nedostupná:', err.message)
    return false
  }

  return true
}

async function testAuth() {
  console.log('🔐 Testování authentizace...')
  
  try {
    // Test přihlášení
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'vondracek.ivan@gmail.com',
      password: 'navi2633'
    })
    
    if (error) {
      console.log('❌ Chyba přihlášení:', error.message)
      return false
    }
    
    console.log('✅ Přihlášení úspěšné:', data.user.email)
    return data.user
  } catch (err) {
    console.log('❌ Auth error:', err.message)
    return false
  }
}

async function testWishlistCreation(user) {
  console.log('📝 Testování vytvoření seznamu...')
  
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        title: 'Test Seznam',
        description: 'Test popis',
        is_public: false
      })
      .select()
      .single()
    
    if (error) {
      console.log('❌ Chyba vytvoření seznamu:', error.message)
      return false
    }
    
    console.log('✅ Seznam vytvořen:', data)
    return data
  } catch (err) {
    console.log('❌ Create error:', err.message)
    return false
  }
}

async function runTests() {
  const dbOk = await testDatabase()
  if (!dbOk) return
  
  const user = await testAuth()
  if (!user) return
  
  const wishlist = await testWishlistCreation(user)
  if (wishlist) {
    console.log('🎉 Všechny testy prošly!')
  }
}

runTests()
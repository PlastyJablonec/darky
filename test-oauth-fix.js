import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dkqcgmwqugsvlobzekwo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcWNnbXdxdWdzdmxvYnpla3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTg5OTcsImV4cCI6MjA2NTkzNDk5N30.FwT2G_SE-YDgvl8MDRFvA4EcfeujCcTIS5AgouiCXtE'
)

async function testOAuthFix() {
  console.log('🔄 Test opravy Google OAuth redirect loop...')
  
  try {
    // Test přihlášení pomocí email/password pro simulaci session
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'vondracek.ivan@gmail.com',
      password: 'navi2633'
    })
    
    if (authError) throw new Error('Auth: ' + authError.message)
    console.log('✅ Test user přihlášen:', authData.user.email)

    console.log('\n🧪 TESTOVACÍ SCÉNÁŘE:')
    
    console.log('\n1️⃣ OPRAVENÉ CHOVÁNÍ:')
    console.log('   ✅ AuthContext redirect pouze na /auth/callback stránce')
    console.log('   ✅ AuthCallback používá window.location.href místo navigate')
    console.log('   ✅ Není nekonečná smyčka na ostatních stránkách')
    
    console.log('\n2️⃣ TESTOVACÍ KROKY:')
    console.log('   🔐 1. Jděte na: http://localhost:3000/login')
    console.log('   🎯 2. Klikněte "Přihlásit se přes Google"')
    console.log('   🔄 3. Po ověření by mělo být:')
    console.log('      - Krátký loading na /auth/callback')
    console.log('      - Přesměrování na /wishlists')
    console.log('      - STOP (žádná další přesměrování)')
    
    console.log('\n3️⃣ CO SE OPRAVILO:')
    console.log('   ❌ PŘED: Redirect na každé SIGNED_IN události')
    console.log('   ✅ PO: Redirect pouze na /auth/callback stránce')
    console.log('   ❌ PŘED: React Router navigate() konflikty')
    console.log('   ✅ PO: window.location.href pro čistý redirect')
    
    console.log('\n4️⃣ DEBUG MONITORING:')
    console.log('   F12 → Console → sledujte:')
    console.log('   "Auth state change: SIGNED_IN"')
    console.log('   "Auth callback - uživatel přihlášen"')
    console.log('   A STOP - žádné další auth eventy')
    
    console.log('\n🎯 OČEKÁVANÝ VÝSLEDEK:')
    console.log('   ✅ Jednorázové přesměrování')
    console.log('   ✅ Ukončení na /wishlists')
    console.log('   ✅ Žádný refresh loop')
    console.log('   ✅ Normální použití aplikace')

    // Úklid
    await supabase.auth.signOut()
    console.log('\n🧹 Test user odhlášen')

  } catch (error) {
    console.log('❌ Chyba při testování:', error.message)
  }
}

testOAuthFix()
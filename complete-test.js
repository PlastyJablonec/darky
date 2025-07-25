import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dkqcgmwqugsvlobzekwo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcWNnbXdxdWdzdmxvYnpla3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTg5OTcsImV4cCI6MjA2NTkzNDk5N30.FwT2G_SE-YDgvl8MDRFvA4EcfeujCcTIS5AgouiCXtE'
)

async function completeTest() {
  console.log('🚀 Kompletní test DárekList aplikace...')
  
  let user, wishlist, gift, shareId
  
  try {
    // 1. Test přihlášení
    console.log('\n1️⃣ Testování přihlášení...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'vondracek.ivan@gmail.com',
      password: 'navi2633'
    })
    
    if (authError) throw new Error('Auth: ' + authError.message)
    user = authData.user
    console.log('✅ Přihlášení úspěšné:', user.email)

    // 2. Test vytvoření seznamu
    console.log('\n2️⃣ Testování vytvoření seznamu...')
    const { data: wishlistData, error: wishlistError } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        title: 'Kompletní Test Seznam',
        description: 'Test všech funkcí',
        is_public: true,
        share_id: 'test-share-' + Date.now()
      })
      .select()
      .single()
    
    if (wishlistError) throw new Error('Wishlist: ' + wishlistError.message)
    wishlist = wishlistData
    shareId = wishlist.share_id
    console.log('✅ Seznam vytvořen:', wishlist.title)
    console.log('🔗 Share ID:', shareId)

    // 3. Test přidání dárku
    console.log('\n3️⃣ Testování přidání dárku...')
    const { data: giftData, error: giftError } = await supabase
      .from('gifts')
      .insert({
        wishlist_id: wishlist.id,
        title: 'Test Dárek',
        description: 'Popis test dárku',
        price: 1500,
        priority: 'high',
        is_group_gift: false
      })
      .select()
      .single()
    
    if (giftError) throw new Error('Gift: ' + giftError.message)
    gift = giftData
    console.log('✅ Dárek přidán:', gift.title, '- Cena:', gift.price, 'Kč')

    // 4. Test veřejného přístupu
    console.log('\n4️⃣ Testování veřejného přístupu...')
    const { data: publicData, error: publicError } = await supabase
      .from('wishlists')
      .select('*')
      .eq('share_id', shareId)
      .eq('is_public', true)
      .single()
    
    if (publicError) throw new Error('Public access: ' + publicError.message)
    console.log('✅ Veřejný přístup funguje:', publicData.title)

    // 5. Test rezervace dárku
    console.log('\n5️⃣ Testování rezervace dárku...')
    const { data: reserveData, error: reserveError } = await supabase
      .from('gifts')
      .update({
        is_reserved: true,
        reserved_by: user.id,
        reserved_at: new Date().toISOString()
      })
      .eq('id', gift.id)
      .select()
      .single()
    
    if (reserveError) throw new Error('Reserve: ' + reserveError.message)
    console.log('✅ Dárek rezervován:', reserveData.is_reserved)

    // 6. Test načtení dárků pro seznam
    console.log('\n6️⃣ Testování načtení dárků...')
    const { data: giftsData, error: giftsError } = await supabase
      .from('gifts')
      .select('*')
      .eq('wishlist_id', wishlist.id)
    
    if (giftsError) throw new Error('Gifts fetch: ' + giftsError.message)
    console.log('✅ Načteno dárků:', giftsData.length)

    // 7. Zobrazit URL pro testování
    console.log('\n🌐 URLs pro testování:')
    console.log('📱 Hlavní aplikace: http://localhost:3000')
    console.log('🔐 Přihlášení: http://localhost:3000/login')
    console.log('📋 Seznamy: http://localhost:3000/wishlists')
    console.log('🔗 Sdílený seznam: http://localhost:3000/shared/' + shareId)
    console.log('🎁 Detail seznamu: http://localhost:3000/wishlists/' + wishlist.id)

    console.log('\n🎉 VŠECHNY TESTY PROŠLY! Aplikace je připravena k použití.')
    
    // Vyčistit test data
    console.log('\n🧹 Čištění test dat...')
    await supabase.from('gifts').delete().eq('id', gift.id)
    await supabase.from('wishlists').delete().eq('id', wishlist.id)
    console.log('✅ Test data vyčištěna')

    return {
      shareUrl: `http://localhost:3000/shared/${shareId}`,
      success: true
    }

  } catch (error) {
    console.log('\n❌ TEST SELHAL:', error.message)
    
    // Vyčistit i při chybě
    if (gift) await supabase.from('gifts').delete().eq('id', gift.id).catch(() => {})
    if (wishlist) await supabase.from('wishlists').delete().eq('id', wishlist.id).catch(() => {})
    
    return { success: false, error: error.message }
  }
}

completeTest()
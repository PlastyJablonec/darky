import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dkqcgmwqugsvlobzekwo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcWNnbXdxdWdzdmxvYnpla3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTg5OTcsImV4cCI6MjA2NTkzNDk5N30.FwT2G_SE-YDgvl8MDRFvA4EcfeujCcTIS5AgouiCXtE'
)

async function testNewFeatures() {
  console.log('🎭 Test nových funkcí - dialogy a teaser efekty...')
  
  try {
    // Přihlášení
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'vondracek.ivan@gmail.com',
      password: 'navi2633'
    })
    
    if (authError) throw new Error('Auth: ' + authError.message)
    console.log('✅ Přihlášen:', authData.user.email)

    // Vytvoření test seznamu s drahým dárkem pro teaser efekt
    const { data: wishlistData, error: wishlistError } = await supabase
      .from('wishlists')
      .insert({
        user_id: authData.user.id,
        title: '🎁 Demo Seznam pro Teaser',
        description: 'Seznam s drahými dárky pro ukázku teaser efektů',
        is_public: true,
        share_id: 'demo-teaser-' + Date.now()
      })
      .select()
      .single()
    
    if (wishlistError) throw new Error('Wishlist: ' + wishlistError.message)
    console.log('✅ Demo seznam vytvořen:', wishlistData.title)

    // Přidání dárku s cenou a URL pro teaser efekt
    const { data: giftData, error: giftError } = await supabase
      .from('gifts')
      .insert({
        wishlist_id: wishlistData.id,
        title: '💎 Drahý Diamond Watch',
        description: 'Luxusní hodinky pro ukázku teaser efektu',
        price: 89999.99,
        currency: 'CZK',
        product_url: 'https://www.rolex.com/watches',
        priority: 'high',
        is_group_gift: true
      })
      .select()
      .single()
    
    if (giftError) throw new Error('Gift: ' + giftError.message)
    console.log('✅ Drahý dárek přidán:', giftData.title, '- Cena:', giftData.price, 'Kč')

    // Přidání levnějšího dárku
    await supabase
      .from('gifts')
      .insert({
        wishlist_id: wishlistData.id,
        title: '📚 Kniha o programování',
        description: 'Zajímavá kniha pro vývojáře',
        price: 599,
        currency: 'CZK',
        product_url: 'https://example.com/book',
        priority: 'medium'
      })

    console.log('✅ Levnější dárek také přidán')

    // Výsledky
    console.log('\n🎯 TESTOVACÍ SCÉNÁŘE:')
    console.log('\n👤 Pro REGISTROVANÉ uživatele:')
    console.log('  📱 Přihlaste se: http://localhost:3000/login')
    console.log('  🎁 Sdílený seznam: http://localhost:3000/shared/' + wishlistData.share_id)
    console.log('  ✨ Měli byste vidět: přesné ceny, funkční odkazy, rezervační tlačítka')
    
    console.log('\n👻 Pro NEREGISTROVANÉ uživatele:')
    console.log('  🌐 Otevřete v anonymním okně: http://localhost:3000/shared/' + wishlistData.share_id)
    console.log('  🔒 Měli byste vidět:')
    console.log('    - Rozmazané ceny se zámkem (kliknutelné)')
    console.log('    - Odkazy na produkty se zámkem')
    console.log('    - Dialog pro registraci místo alertů')
    console.log('    - Motivující zprávy k registraci')

    console.log('\n📋 CHECKLIST funkcí:')
    console.log('  ✅ Dialogy místo alertů')
    console.log('  ✅ Rozmazané ceny pro neregistrované')
    console.log('  ✅ Zámky na odkazech')
    console.log('  ✅ Motivující zprávy')
    console.log('  ✅ Hovering tooltips')
    console.log('  ✅ Auth dialog s benefity')

    console.log('\n🧹 Vyčistit test data za 30 sekund...')
    setTimeout(async () => {
      await supabase.from('gifts').delete().eq('wishlist_id', wishlistData.id)
      await supabase.from('wishlists').delete().eq('id', wishlistData.id)
      console.log('✅ Test data vyčištěna')
    }, 30000)

  } catch (error) {
    console.log('❌ Chyba při testování:', error.message)
  }
}

testNewFeatures()
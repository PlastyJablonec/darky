# 🎁 DárekList - Nová verze pro Vercel

Moderní aplikace pro správu seznamů přání vytvořená v React + TypeScript + Supabase.

## ✨ Funkce

- 🔐 **Autentizace** - Email/heslo + Google OAuth
- 📝 **Seznamy přání** - Vytváření, úprava, sdílení
- 🎁 **Správa dárků** - Přidávání, rezervace, priority
- 🔗 **Sdílení** - Veřejné odkazy pro sdílení s přáteli
- 📱 **Responzivní design** - Funguje na všech zařízeních
- ⚡ **Real-time aktualizace** - Okamžité změny přes Supabase

## 🚀 Rychlý start

### 1. Naklonování a instalace

```bash
cd /home/pi/programovani/darky-nova
npm install
```

### 2. Nastavení Supabase

1. Vytvořte nový projekt na [Supabase](https://supabase.com)
2. Vytvořte `.env.local` soubor podle `.env.example`
3. Zkopírujte URL a anon key z Supabase Settings > API

```bash
cp .env.example .env.local
# Upravte .env.local s vašimi údaji
```

### 3. Databázové schéma

Spusťte tento SQL kód v Supabase SQL editoru:

```sql
-- Rozšíření users tabulky
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Wishlists tabulka
CREATE TABLE public.wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  occasion TEXT,
  is_public BOOLEAN DEFAULT false,
  share_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gifts tabulka
CREATE TABLE public.gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'CZK',
  product_url TEXT,
  image_url TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_reserved BOOLEAN DEFAULT false,
  reserved_by UUID REFERENCES auth.users(id),
  reserved_at TIMESTAMP WITH TIME ZONE,
  is_group_gift BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Políčky pro wishlists
CREATE POLICY "users_own_wishlists" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "public_wishlists_readable" ON public.wishlists
  FOR SELECT USING (is_public = true);

-- Políčky pro gifts
CREATE POLICY "users_own_gifts" ON public.gifts
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.wishlists WHERE id = gifts.wishlist_id
    )
  );

CREATE POLICY "public_gifts_readable" ON public.gifts
  FOR SELECT USING (
    wishlist_id IN (
      SELECT id FROM public.wishlists WHERE is_public = true
    )
  );

CREATE POLICY "authenticated_users_can_reserve" ON public.gifts
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    wishlist_id IN (
      SELECT id FROM public.wishlists WHERE is_public = true
    )
  );
```

### 4. Google OAuth (volitelné)

1. V Supabase Console → Authentication → Providers
2. Povolte Google provider
3. Přidejte Client ID a Secret z Google Console

### 5. Spuštění aplikace

```bash
# Development
npm run dev

# Build pro produkci
npm run build

# Preview produkční verze
npm run preview
```

## 📦 Deployment na Vercel

### Automatický deployment

1. Pushněte kód na GitHub
2. Připojte GitHub repo na [Vercel](https://vercel.com)
3. Nastavte environment variables v Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Manuální deployment

```bash
npm install -g vercel
npm run build
vercel --prod
```

## 🏗️ Struktura projektu

```
src/
├── components/          # React komponenty
│   ├── Layout.tsx      # Hlavní layout
│   ├── ProtectedRoute.tsx
│   ├── WishlistCard.tsx
│   ├── WishlistModal.tsx
│   ├── GiftCard.tsx
│   └── GiftModal.tsx
├── pages/              # Stránky aplikace
│   ├── Home.tsx        # Domovská stránka
│   ├── Login.tsx       # Přihlášení
│   ├── Register.tsx    # Registrace
│   ├── Wishlists.tsx   # Přehled seznamů
│   └── WishlistDetail.tsx
├── hooks/              # Custom React hooks
│   ├── useWishlists.ts # Hook pro seznamy
│   └── useGifts.ts     # Hook pro dárky
├── services/           # API služby
│   ├── wishlistService.ts
│   └── giftService.ts
├── context/            # React context
│   └── AuthContext.tsx # Autentizace
├── config/             # Konfigurace
│   └── supabase.ts     # Supabase client
└── types/              # TypeScript typy
    └── index.ts
```

## 🎨 Technologie

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend (databáze, auth, real-time)
- **React Router** - Routing
- **Lucide React** - Ikony
- **Headless UI** - Accessible komponenty

## 📝 Klíčové rozdíly od původní verze

✅ **Rozdělené soubory** - Všechny soubory mají max 500 řádků  
✅ **Optimalizováno pro Vercel** - Včetně vercel.json  
✅ **Čisté TypeScript typy** - Separátní types soubor  
✅ **Modulární hooks** - useWishlists, useGifts  
✅ **Separátní komponenty** - WishlistCard, GiftCard, modály  
✅ **Supabase real-time** - Okamžité aktualizace  
✅ **RLS políčky** - Bezpečnost na databázové úrovni  

## 🔧 Možná rozšíření

- 📧 Email notifikace (Supabase Edge Functions)
- 🔍 Fulltextové vyhledávání
- 📊 Analytika a statistiky
- 🌍 Podpora více jazyků
- 📱 PWA podpora
- 🎨 Více témat a customizace

## 📞 Podpora

Pro dotazy a problémy vytvořte issue nebo kontaktujte vývojáře.

---

*Vytvořeno s ❤️ pro snadné sdílení přání*
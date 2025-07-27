# 🚀 Deployment Guide - DárekList

## GitHub Setup

1. Vytvoř nové GitHub repository:
   - Jdi na https://github.com/new
   - Repository name: `darky-nova` nebo `darek-list`
   - Description: `Aplikace pro správu seznamů přání s funkcí sdílení`
   - Public/Private: podle preference
   - **NEVYTVÁŘEJ** README, .gitignore nebo license (už je máme)

2. Přidej remote origin:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Vercel Deployment

### Option 1: Automatické nasazení (doporučené)

1. Jdi na https://vercel.com/new
2. Import tvého GitHub repository
3. Nastav Environment Variables:
   - `VITE_SUPABASE_URL`: URL tvého Supabase projektu
   - `VITE_SUPABASE_ANON_KEY`: Public anon key z Supabase

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Environment Variables

Nezapomeň nastavit tyto proměnné ve Vercel:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Supabase Setup

Ujisti se, že máš v Supabase:

1. **Authentication** povolené
2. **Database** s tabulkami:
   - `wishlists`
   - `gifts` 
   - `wishlist_shares`
   - `wishlist_views`

3. **Row Level Security (RLS)** aktivované
4. **URL pro redirect** nastavenou na tvoji Vercel doménu

## Po nasazení

1. Otestuj registraci a přihlášení
2. Zkus vytvořit seznam přání
3. Otestuj sdílení seznamu
4. Zkontroluj responzivnost na mobilu

## 🎉 Hotovo!

Tvoje aplikace bude dostupná na: `https://your-project.vercel.app`
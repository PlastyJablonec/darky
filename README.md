# 🎁 DárekList

**Moderní aplikace pro správu a sdílení seznamů přání.**

Už žádné nechtěné dárky nebo trapné situace, kdy dostanete to samé dvakrát. S DárekListem vytvoříte seznam, sdílíte ho s blízkými a oni si dárky jednoduše zarezervují.

## ✨ Klíčové Funkce

### 📝 Správa Seznamů
- **Neomezené seznamy**: Vytvořte si seznam pro každou příležitost – Vánoce, Narozeniny, Svatba nebo jen tak pro radost.
- **Dva typy seznamů**:
    - **Osobní**: Klasický seznam pro vaše přání. Vy jako majitel **nevidíte**, kdo a co vám rezervoval. Překvapení zůstává zachováno! 🤫
    - **Spravovaný**: Ideální pro děti nebo hromadné akce. Jako majitel **vidíte** veškeré rezervace a máte dokonalý přehled o tom, co kdo kupuje.
- **Inteligentní návrhy (AI v4.0)**: Pokud vám dochází inspirace, AI (Google Gemini) analyzuje stávající položky v seznamu a navrhne 3 další dárky, které by se mohly oslavenci líbit. Funguje i v offline režimu díky robustnímu fallback systému.y.
- **Snadné přidávání dárků**: Vložte název, odkaz, cenu a obrázek. Dárky můžete řadit podle priority.

### 🤝 Sdílení a Rezervace
- **Jednoduché sdílení**: Pošlete unikátní odkaz rodině nebo přátelům. Nemusí se registrovat, aby viděli váš seznam.
- **Rezervace dárků**:
    - "Ježíšek" si dárek zarezervuje, aby ostatní věděli, že už je zabraný.
    - Pro rezervaci je nutné přihlášení (aby se vědělo, kdo rezervoval).
    - U Osobních seznamů majitel rezervaci nevidí.
    - U Spravovaných seznamů majitel rezervaci vidí.

### 💰 Skupinové Dárky
- Máte přání, které je dražší? Označte dárek jako **Skupinový**.
- Ostatní uvidí, že se jedná o větší investici a mohou se domluvit na společném nákupu.

### 📱 Moderní a Responzivní
- Aplikace je plně optimalizovaná pro **mobily, tablety i počítače**.
- Nainstalujte si ji jako webovou aplikaci (PWA) přímo na plochu telefonu.

---

## 🛠️ Jak to funguje?

### 1. Vytvořte seznam
Přihlašte se a vytvořte nový seznam. Zvolte, zda je pro vás (Osobní) nebo pro někoho jiného (Spravovaný).

### 2. Přidejte přání
Naházejte do seznamu všechno, co by vám udělalo radost. Přidejte odkazy na e-shopy, ať to mají "Ježíšci" jednoduché.

### 3. Sdílejte
V detailu seznamu klikněte na tlačítko sdílení nebo zkopírujte adresu v prohlížeči. Odkaz pošlete komukoliv.

### 4. Rezervace (pohled obdarovávajícího)
Když někdo otevře váš odkaz, uvidí seznam dárků. U každého dárku je tlačítko "Rezervovat". Pokud na něj klikne, dárek se označí jako "Zarezervované" pro všechny ostatní návštěvníky, ale vy (pokud jde o Osobní seznam) nic nepoznáte.

---

## 👨‍💻 Technologie

Projekt je postaven na moderním stacku pro maximální rychlost a spolehlivost:

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, DaisyUI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Hosting**: Vercel

## 🚀 Instalace pro vývojáře

1.  **Klonování repozitáře**
    ```bash
    git clone <url-repozitare>
    cd dareklist-app
    ```

2.  **Instalace závislostí**
    ```bash
    npm install
    ```

3.  **Konfigurace prostředí**
    Vytvořte `.env` soubor a nastavte Supabase klíče:
    ```env
    VITE_SUPABASE_URL=vas_url
    VITE_SUPABASE_ANON_KEY=vas_klic
    ```

4.  **Spuštění**
    ```bash
    npm run dev
    ```

---

## 📝 Licence a Autor

Vytvořil [Ivan Vondráček].
Aplikace vznikla jako projekt pro usnadnění vánočního shonu. 🎄
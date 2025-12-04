# DárekList

Moderní webová aplikace pro správu a sdílení seznamů přání. Umožňuje uživatelům vytvářet seznamy dárků, sdílet je s rodinou a přáteli a koordinovat nákupy, aby se předešlo duplicitním dárkům.

## 🚀 Funkce

- **Správa seznamů přání**: Vytvářejte neomezené množství seznamů pro různé příležitosti (Vánoce, Narozeniny, Svatba...).
- **Sdílení**: Sdílejte seznamy pomocí unikátního odkazu.
- **Rezervace dárků**: Přátelé mohou dárky rezervovat, takže ostatní vidí, co je již zabrané (majitel seznamu rezervace nevidí, aby nepřišel o překvapení).
- **Skupinové dárky**: Možnost označit dražší dárky jako "skupinové", na které se může složit více lidí.
- **Responzivní design**: Plně funkční na mobilech, tabletech i počítačích.
- **Google Přihlášení**: Rychlé a bezpečné přihlášení pomocí Google účtu.

## 🛠️ Technologie

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS v4, DaisyUI
- **Backend / Databáze**: Supabase (PostgreSQL, Auth, Realtime)
- **Ikony**: Lucide React

## 📦 Instalace a spuštění

1.  **Naklonujte repozitář:**
    ```bash
    git clone <url-repozitare>
    cd dareklist-app
    ```

2.  **Nainstalujte závislosti:**
    ```bash
    npm install
    ```

3.  **Nastavte prostředí:**
    Vytvořte soubor `.env` v kořenovém adresáři a přidejte své Supabase klíče:
    ```env
    VITE_SUPABASE_URL=vase_supabase_url
    VITE_SUPABASE_ANON_KEY=vas_supabase_anon_key
    ```

4.  **Spusťte vývojový server:**
    ```bash
    npm run dev
    ```
    Aplikace poběží na `http://localhost:3000`.

## 🔧 Build a Nasazení

Pro vytvoření produkčního buildu spusťte:

```bash
npm run build
```

Soubory se vygenerují do složky `dist`.

Před každým buildem (nebo ručně) se spouští skript `scripts/build-info.js`, který generuje informace o verzi a aktuálním commitu do `public/build-info.json`. Tyto informace se pak zobrazují v patičce aplikace.

## 📱 Mobilní zobrazení
# DárekList

Moderní webová aplikace pro správu a sdílení seznamů přání. Umožňuje uživatelům vytvářet seznamy dárků, sdílet je s rodinou a přáteli a koordinovat nákupy, aby se předešlo duplicitním dárkům.

## 🚀 Funkce

- **Správa seznamů přání**: Vytvářejte neomezené množství seznamů pro různé příležitosti (Vánoce, Narozeniny, Svatba...).
- **Sdílení**: Sdílejte seznamy pomocí unikátního odkazu.
- **Rezervace dárků**: Přátelé mohou dárky rezervovat, takže ostatní vidí, co je již zabrané (majitel seznamu rezervace nevidí, aby nepřišel o překvapení).
- **Skupinové dárky**: Možnost označit dražší dárky jako "skupinové", na které se může složit více lidí.
- **Responzivní design**: Plně funkční na mobilech, tabletech i počítačích.
- **Google Přihlášení**: Rychlé a bezpečné přihlášení pomocí Google účtu.

## 🛠️ Technologie

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS v4, DaisyUI
- **Backend / Databáze**: Supabase (PostgreSQL, Auth, Realtime)
- **Ikony**: Lucide React

## 📦 Instalace a spuštění

1.  **Naklonujte repozitář:**
    ```bash
    git clone <url-repozitare>
    cd dareklist-app
    ```

2.  **Nainstalujte závislosti:**
    ```bash
    npm install
    ```

3.  **Nastavte prostředí:**
    Vytvořte soubor `.env` v kořenovém adresáři a přidejte své Supabase klíče:
    ```env
    VITE_SUPABASE_URL=vase_supabase_url
    VITE_SUPABASE_ANON_KEY=vas_supabase_anon_key
    ```

4.  **Spusťte vývojový server:**
    ```bash
    npm run dev
    ```
    Aplikace poběží na `http://localhost:3000`.

## 🔧 Build a Nasazení

Pro vytvoření produkčního buildu spusťte:

```bash
npm run build
```

Soubory se vygenerují do složky `dist`.

Před každým buildem (nebo ručně) se spouští skript `scripts/build-info.js`, který generuje informace o verzi a aktuálním commitu do `public/build-info.json`. Tyto informace se pak zobrazují v patičce aplikace.

## 📱 Mobilní zobrazení

Aplikace je optimalizována pro mobilní zařízení:
- Skrývání méně důležitých textů v navigaci.
- Sticky hlavička pro snadný přístup k menu.
- Přizpůsobené formuláře a tlačítka pro dotykové ovládání.

- **Typy seznamů**:
  - **Osobní**: Majitel nevidí rezervace (překvapení).
  - **Spravovaný**: Majitel vidí rezervace (přehled, např. pro děti).

## 📝 Autor

Ivan Vondráček
Verze: 1.2.0
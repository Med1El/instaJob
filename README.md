# ConcourNow

Application SaaS qui scrape quotidiennement les offres d'emploi public marocain et notifie les utilisateurs des correspondances selon leur profil.

## Stack

- **Frontend/API** : Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Base de données** : Supabase (PostgreSQL)
- **Scraper** : Playwright (GitHub Actions)
- **IA** : Gemini API (gratuit) ou DeepSeek
- **Email** : Resend
- **Push** : Web Push API (VAPID)
- **i18n** : next-intl (ar, fr, en)

## Démarrage rapide

### 1. Installation des dépendances

```bash
cd app
npm install
```

### 2. Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter le fichier `supabase/migrations/001_initial_schema.sql` dans le SQL Editor
3. Récupérer l'URL et les clés API dans Settings > API

### 3. Variables d'environnement

```bash
cp .env.local.example .env.local
# Remplir toutes les valeurs dans .env.local
```

**Générer les clés VAPID :**
```bash
npx web-push generate-vapid-keys
```

### 4. Lancer en développement

```bash
npm run dev
```

### 5. Créer un compte admin

1. Créer un compte via `/signup`
2. Dans Supabase Dashboard > Table Editor > users
3. Mettre `role = admin` et `status = active` pour ce compte

### 6. Premier scraping

```bash
# En local (nécessite Playwright installé)
npm run scrape

# Ou forcer le mode premier run (5 pages)
FIRST_RUN=true node scripts/scraper.mjs
```

## GitHub Actions (Cron automatique)

Le scraping tourne automatiquement à 20:00 UTC chaque jour.

**Secrets GitHub à configurer** (`Settings > Secrets > Actions`) :
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_PROVIDER` (valeur : `gemini` ou `deepseek`)
- `GEMINI_API_KEY`
- `DEEPSEEK_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `NEXT_PUBLIC_APP_URL`

## Déploiement (Vercel)

1. Connecter le repo sur [vercel.com](https://vercel.com)
2. Root directory : `app`
3. Ajouter les variables d'environnement depuis `.env.local.example`

## Architecture

```
GitHub Actions (cron 20:00 UTC)
  └── Playwright Scraper
        ├── Scrape emploi-public.ma page par page
        ├── AI Analysis (Gemini/DeepSeek) par post
        ├── Match Engine (specialty × diploma × exp × region × city)
        └── Notifications (email + push)

Next.js App (Vercel)
  ├── /[locale]/ — Landing
  ├── /[locale]/auth/ — Auth (login, signup, pending, inactive)
  ├── /[locale]/app/ — Dashboard utilisateur (protégé)
  │     ├── /matches — Toutes les correspondances
  │     ├── /new-matches — Correspondances des 24h
  │     └── /settings — Préférences notifications
  └── /[locale]/admin/ — Admin (protégé, rôle admin)
        ├── /users — Gestion utilisateurs
        └── /scrape — Historique + déclenchement manuel
```

## Catégories de matching

Voir `lib/categories.ts` pour la liste complète des spécialités, diplômes, tranches d'expérience, régions et villes.

Les catégories sont hardcodées et ne doivent PAS être exposées comme filtres côté utilisateur (modèle commercial).

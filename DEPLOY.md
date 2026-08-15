# Déploiement e-sekooly — Render + Vercel + Neon

## 1. Neon (PostgreSQL)
- Créer un projet Neon
- Copier l'URL de connexion (ex: `postgresql://user:pass@ep-xxx.region.neon.tech/neondb?sslmode=require`)
- La coller dans `backend/.env` en local et dans Render > Environment

## 2. Render (Backend)
- Créer un Web Service, importer le repo
- Root Directory: `backend`
- Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- Start Command: `npm start`
- Variables d'environnement:
  - `DATABASE_URL` = URL Neon
  - `JWT_ACCESS_SECRET` = secret fort
  - `JWT_REFRESH_SECRET` = autre secret fort
  - `CORS_ORIGIN` = URL Vercel du frontend
  - `NODE_ENV` = `production`
  - `PORT` = `10000`

## 3. Vercel (Frontend)
- Créer un projet, importer le repo
- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Variables d'environnement:
  - `VITE_API_URL` = URL Render du backend + `/api`

## 4. Après déploiement
- Tester `https://ton-backend.onrender.com/api/health`
- Tester la connexion depuis le frontend Vercel
- Mettre à jour `CORS_ORIGIN` sur Render si nécessaire
- Lancer le seed si besoin: `npx prisma db seed`

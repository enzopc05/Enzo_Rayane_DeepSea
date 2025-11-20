# 🌊 DeepSea Archives - Backend

Plateforme de répertoire de créatures abyssales imaginaires avec système d'observations et de validation par des experts.

## 👥 Équipe
- **Enzo Pace** - enzopc05
- **Rayane Menkar** - RayaneMkr

## 🏗️ Architecture

Le projet est composé de **2 microservices** :

### 1. Auth Service (Port 3001)
Service d'authentification et de gestion des utilisateurs avec système de rôles (USER, EXPERT, ADMIN).

### 2. Observation Service (Port 3002)
Service de gestion des espèces et des observations avec validation par les experts.

## 🛠️ Stack Technique

- **Framework** : Express.js
- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **Authentification** : JWT
- **Validation** : Middleware custom
- **Architecture** : Microservices avec séparation en service layers

## 📋 Prérequis

- Node.js >= 16
- Docker Desktop (pour PostgreSQL)
- Postman (pour tester l'API)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd Enzo_Rayane_DeepSea
```

### 2. Démarrer la base de données

```bash
docker-compose up -d
```

Vérifier que PostgreSQL est bien démarré :
```bash
docker ps
```

### 3. Installer Auth Service

```bash
cd auth-service
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Installer Observation Service

```bash
cd ../observation-service
npm install
npx prisma generate
npx prisma migrate dev --name init
```

## 🎯 Lancement des services

### Terminal 1 - Auth Service
```bash
cd auth-service
npm run dev
```
✅ Service démarré sur `http://localhost:3001`

### Terminal 2 - Observation Service
```bash
cd observation-service
npm run dev
```
✅ Service démarré sur `http://localhost:3002`

### Vérification du fonctionnement

**Auth Service :**
```bash
curl http://localhost:3001/health
```

**Observation Service :**
```bash
curl http://localhost:3002/health
```

## 📡 API Documentation

### 🔐 Auth Service - Endpoints

#### 1. Inscription
```http
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "role": "USER",
    "reputation": 0
  }
}
```

#### 2. Connexion
```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "role": "USER"
  }
}
```

#### 3. Profil utilisateur
```http
GET http://localhost:3001/auth/me
Authorization: Bearer {token}
```

#### 4. Liste des utilisateurs (ADMIN uniquement)
```http
GET http://localhost:3001/auth/admin/users
Authorization: Bearer {token_admin}
```

#### 5. Modifier le rôle d'un utilisateur (ADMIN uniquement)
```http
PATCH http://localhost:3001/auth/users/{userId}/role
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "role": "EXPERT"
}
```

#### 6. Récupérer un utilisateur par ID
```http
GET http://localhost:3001/auth/users/{userId}
```

#### 7. Mettre à jour la réputation
```http
PATCH http://localhost:3001/auth/users/{userId}/reputation
Content-Type: application/json

{
  "reputationChange": 5
}
```

### 🐙 Observation Service - Endpoints

#### 1. Créer une espèce
```http
POST http://localhost:3002/species
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Kraken Abyssal",
  "description": "Créature tentaculaire des profondeurs marines",
  "dangerLevel": 5
}
```

**Règles :**
- `name` : unique et obligatoire
- `description` : obligatoire
- `dangerLevel` : entre 1 et 5

#### 2. Lister toutes les espèces
```http
GET http://localhost:3002/species
Authorization: Bearer {token}
```

#### 3. Récupérer une espèce par ID
```http
GET http://localhost:3002/species/{speciesId}
Authorization: Bearer {token}
```

#### 4. Créer une observation
```http
POST http://localhost:3002/observations
Authorization: Bearer {token}
Content-Type: application/json

{
  "speciesId": "uuid-de-l-espece",
  "description": "Spécimen observé à 3000m de profondeur"
}
```

**Règles :**
- `description` : obligatoire
- Impossible de soumettre 2 observations de la même espèce en moins de 5 minutes

#### 5. Lister les observations d'une espèce
```http
GET http://localhost:3002/species/{speciesId}/observations
Authorization: Bearer {token}
```

#### 6. Valider une observation (EXPERT/ADMIN uniquement)
```http
POST http://localhost:3002/observations/{observationId}/validate
Authorization: Bearer {token_expert}
```

**Règles :**
- Impossible de valider sa propre observation
- L'observation doit être en statut PENDING

#### 7. Rejeter une observation (EXPERT/ADMIN uniquement)
```http
POST http://localhost:3002/observations/{observationId}/reject
Authorization: Bearer {token_expert}
```

**Règles :**
- Impossible de rejeter sa propre observation
- L'observation doit être en statut PENDING

## 🧪 Scénario de test complet

### Étape 1 : Créer les utilisateurs

**Créer un utilisateur normal :**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","username":"testuser","password":"password123"}'
```

**Créer un admin :**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","username":"admin","password":"admin123"}'
```

**Créer un expert :**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"expert@test.com","username":"expert","password":"expert123"}'
```

### Étape 2 : Se connecter et récupérer les tokens

**User :**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'
```
→ Sauvegarder le `token` retourné

**Admin :**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```
→ Sauvegarder le `token` retourné

**Expert :**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"expert@test.com","password":"expert123"}'
```
→ Sauvegarder le `token` retourné

### Étape 3 : Promouvoir les rôles (avec le token admin)

**Promouvoir admin en ADMIN :**
```bash
curl -X PATCH http://localhost:3001/auth/users/{ID_ADMIN}/role \
  -H "Authorization: Bearer {TOKEN_ADMIN}" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

**Promouvoir expert en EXPERT :**
```bash
curl -X PATCH http://localhost:3001/auth/users/{ID_EXPERT}/role \
  -H "Authorization: Bearer {TOKEN_ADMIN}" \
  -H "Content-Type: application/json" \
  -d '{"role":"EXPERT"}'
```

### Étape 4 : Créer une espèce (avec le token user)

```bash
curl -X POST http://localhost:3002/species \
  -H "Authorization: Bearer {TOKEN_USER}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Leviathan des Abysses",
    "description": "Créature gigantesque observée dans la fosse des Mariannes",
    "dangerLevel": 5
  }'
```

### Étape 5 : Créer une observation (avec le token user)

```bash
curl -X POST http://localhost:3002/observations \
  -H "Authorization: Bearer {TOKEN_USER}" \
  -H "Content-Type: application/json" \
  -d '{
    "speciesId": "{ID_SPECIES}",
    "description": "Spécimen de 50m observé à 4000m de profondeur"
  }'
```

### Étape 6 : Valider l'observation (avec le token expert)

```bash
curl -X POST http://localhost:3002/observations/{ID_OBSERVATION}/validate \
  -H "Authorization: Bearer {TOKEN_EXPERT}"
```

## 📊 Modèles de données

### User (auth-service)
```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  username   String   @unique
  password   String
  role       Role     @default(USER)
  reputation Int      @default(0)
  createdAt  DateTime @default(now())
}

enum Role {
  USER
  EXPERT
  ADMIN
}
```

### Species (observation-service)
```prisma
model Species {
  id           String        @id @default(uuid())
  authorId     String
  name         String        @unique
  description  String?
  dangerLevel  Int           @default(1)
  createdAt    DateTime      @default(now())
  observations Observation[]
}
```

### Observation (observation-service)
```prisma
model Observation {
  id          String            @id @default(uuid())
  speciesId   String
  authorId    String
  description String
  status      ObservationStatus @default(PENDING)
  validatedBy String?
  validatedAt DateTime?
  createdAt   DateTime          @default(now())
  species     Species           @relation(fields: [speciesId], references: [id])
}

enum ObservationStatus {
  PENDING
  VALIDATED
  REJECTED
}
```

## 🔒 Règles métier implémentées

### Auth Service
✅ Hash des mots de passe avec bcryptjs
✅ JWT avec expiration de 7 jours
✅ Système de rôles (USER, EXPERT, ADMIN)
✅ Routes protégées par authentification
✅ Routes admin réservées aux ADMIN
✅ Validation des emails et mots de passe
✅ Système de réputation (promotion automatique à 10 points)

### Observation Service
✅ Impossible de créer deux espèces avec le même nom
✅ Description obligatoire pour les espèces et observations
✅ DangerLevel entre 1 et 5
✅ Impossible de soumettre 2 observations de la même espèce en < 5 minutes
✅ Impossible de valider/rejeter sa propre observation
✅ Seuls les EXPERT et ADMIN peuvent valider/rejeter
✅ Une observation ne peut être traitée qu'une seule fois
✅ Communication entre services via JWT

## 🐛 Dépannage

### Erreur : "Can't reach database server"
→ Vérifier que Docker Desktop est démarré
→ Vérifier que PostgreSQL tourne : `docker ps`

### Erreur : "Token invalide"
→ Vérifier que le JWT_SECRET est identique dans les deux `.env`
→ Régénérer un token en se reconnectant

### Erreur : "Port already in use"
→ Vérifier qu'aucun autre service n'utilise les ports 3001 ou 3002
→ Modifier le port dans le fichier `.env` si nécessaire

## 📝 Structure du projet

```
Enzo_Rayane_DeepSea/
├── auth-service/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── jwt.js
│   │   ├── controllers/
│   │   │   └── auth.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   └── auth.routes.js
│   │   ├── services/
│   │   │   └── auth.service.js
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── observation-service/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── jwt.js
│   │   ├── controllers/
│   │   │   ├── observation.controller.js
│   │   │   └── species.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── observation.routes.js
│   │   │   └── species.routes.js
│   │   ├── services/
│   │   │   ├── observation.service.js
│   │   │   └── species.service.js
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── docker-compose.yml
├── init-db.sql
└── README.md
```

## 🎓 Niveau atteint : 10/20

### Fonctionnalités implémentées :
✅ 2 microservices fonctionnels (auth-service + observation-service)
✅ Authentification JWT complète
✅ Système de rôles (USER, EXPERT, ADMIN)
✅ CRUD complet sur les espèces
✅ Gestion des observations avec validation
✅ Communication entre microservices
✅ Toutes les règles métier de base
✅ Architecture en service layers
✅ Documentation complète

## 📦 Technologies utilisées

- **Express.js** : Framework web
- **Prisma** : ORM
- **PostgreSQL** : Base de données
- **JWT** : Authentification
- **bcryptjs** : Hash des mots de passe
- **Docker** : Conteneurisation de PostgreSQL

## 👨‍💻 Auteurs

- Enzo - [enzopc05]
- Rayane

## 📄 Licence

MIT
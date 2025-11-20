# 🌊 DeepSea Archives - Backend

Plateforme de répertoire de créatures abyssales imaginaires avec système d'observations et de validation par des experts.

## 👥 Équipe
- **Enzo Pace** - enzopc05
- **Rayane Menkar** - RayaneMkr

## 🏗️ Architecture

Le projet est composé de **3 microservices** :

### 1. Auth Service (Port 3001)
Service d'authentification et de gestion des utilisateurs avec système de rôles (USER, EXPERT, ADMIN).

### 2. Observation Service (Port 3002)
Service de gestion des espèces et des observations avec validation par les experts. Inclut la modération avancée avec suppression logique et historisation.

### 3. Taxonomy Service (Port 3003)
Service dédié à l'analyse et à la classification des espèces. Génère des statistiques globales et organise les espèces en familles taxonomiques.

## 🛠️ Stack Technique

- **Framework** : Express.js
- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **Authentification** : JWT
- **Validation** : Middleware custom
- **Architecture** : Microservices avec séparation en service layers
- **Communication inter-services** : HTTP REST avec axios

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

### 2. Démarrer les bases de données

```bash
docker-compose up -d
```

Vérifier que PostgreSQL est bien démarré :
```bash
docker ps
```

Vous devriez voir 3 containers :
- `deepsea_auth_db` (Port 5432)
- `deepsea_observation_db` (Port 5433)
- `deepsea_taxonomy_db` (Port 5434)

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

### 5. Installer Taxonomy Service

```bash
cd ../taxonomy-service
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

### Terminal 3 - Taxonomy Service
```bash
cd taxonomy-service
npm run dev
```
✅ Service démarré sur `http://localhost:3003`

### Vérification du fonctionnement

**Auth Service :**
```bash
curl http://localhost:3001/health
```

**Observation Service :**
```bash
curl http://localhost:3002/health
```

**Taxonomy Service :**
```bash
curl http://localhost:3003/health
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

#### 2. Connexion
```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
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

---

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

#### 7. Rejeter une observation (EXPERT/ADMIN uniquement)
```http
POST http://localhost:3002/observations/{observationId}/reject
Authorization: Bearer {token_expert}
```

---

### 🔧 Admin Routes - Modération avancée (ADMIN uniquement)

#### 8. Supprimer logiquement une observation
```http
DELETE http://localhost:3002/admin/observations/{observationId}
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "reason": "Contenu inapproprié"
}
```

#### 9. Restaurer une observation supprimée
```http
POST http://localhost:3002/admin/observations/{observationId}/restore
Authorization: Bearer {token_admin}
```

#### 10. Historique d'un utilisateur
```http
GET http://localhost:3002/admin/user/{userId}/history
Authorization: Bearer {token_admin}
```

Retourne toutes les actions liées aux observations de cet utilisateur (créations, validations, rejets, suppressions).

#### 11. Liste des observations supprimées
```http
GET http://localhost:3002/admin/observations/deleted
Authorization: Bearer {token_admin}
```

#### 12. Historique d'une observation spécifique
```http
GET http://localhost:3002/admin/observations/{observationId}/history
Authorization: Bearer {token_admin}
```

---

### 🧬 Expert Routes (EXPERT/ADMIN uniquement)

#### 13. Historique d'une espèce
```http
GET http://localhost:3002/expert/species/{speciesId}/history
Authorization: Bearer {token_expert}
```

Retourne toutes les actions (validations, rejets) sur les observations de cette espèce.

---

### 🧬 Taxonomy Service - Endpoints

#### 1. Statistiques taxonomiques globales
```http
GET http://localhost:3003/taxonomy/stats
Authorization: Bearer {token}
```

**Réponse :**
```json
{
  "totalSpecies": 15,
  "totalObservations": 48,
  "avgObservationsPerSpecies": 3.2,
  "speciesClassification": [
    {
      "id": "uuid",
      "name": "Kraken Abyssal",
      "dangerLevel": 5,
      "totalObservations": 8,
      "validatedObservations": 6,
      "family": "Cephalopodes Géants",
      "subfamily": "Kraken",
      "evolutionBranch": "Prédateur Apex",
      "keywords": ["tentacules", "profondeur", "gigantesque"]
    }
  ],
  "keywords": [
    { "word": "profondeur", "occurrences": 23 },
    { "word": "bioluminescence", "occurrences": 18 }
  ]
}
```

**Fonctionnalités :**
- Nombre total d'espèces et d'observations
- Moyenne d'observations par espèce
- Classification hiérarchique (famille, sous-espèce, branche évolutive)
- Extraction des mots-clés récurrents dans les descriptions
- Organisation des espèces par niveau de danger

---

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
  id            String               @id @default(uuid())
  speciesId     String
  authorId      String
  description   String
  status        ObservationStatus    @default(PENDING)
  validatedBy   String?
  validatedAt   DateTime?
  deletedBy     String?
  deletedAt     DateTime?
  deletedReason String?
  createdAt     DateTime             @default(now())
  species       Species              @relation(...)
  history       ObservationHistory[]
}

enum ObservationStatus {
  PENDING
  VALIDATED
  REJECTED
  DELETED
}
```

### ObservationHistory (observation-service)
```prisma
model ObservationHistory {
  id              String      @id @default(uuid())
  observationId   String
  action          String      // CREATED, VALIDATED, REJECTED, DELETED, RESTORED
  performedBy     String
  performedByRole String
  previousStatus  String?
  newStatus       String
  comment         String?
  timestamp       DateTime    @default(now())
  observation     Observation @relation(...)
}
```

### TaxonomyCache (taxonomy-service)
```prisma
model TaxonomyCache {
  id              String   @id @default(uuid())
  speciesId       String   @unique
  family          String?
  subfamily       String?
  evolutionBranch String?
  lastUpdated     DateTime @default(now())
}
```

---

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
✅ **Suppression logique (soft delete) par ADMIN**  
✅ **Restauration des observations supprimées par ADMIN**  
✅ **Historisation complète de toutes les actions**  
✅ **Impossible de valider/rejeter une observation supprimée**

### Taxonomy Service
✅ Interrogation de l'observation-service pour récupérer les données  
✅ Classification automatique en familles et sous-espèces  
✅ Organisation par branches évolutives  
✅ Extraction de mots-clés récurrents (avec stopwords français)  
✅ Génération de statistiques globales  
✅ Cache des classifications taxonomiques

---

## 🐛 Dépannage

### Erreur : "Can't reach database server"
→ Vérifier que Docker Desktop est démarré  
→ Vérifier que PostgreSQL tourne : `docker ps`

### Erreur : "Token invalide"
→ Vérifier que le JWT_SECRET est identique dans les 3 `.env`  
→ Régénérer un token en se reconnectant

### Erreur : "Port already in use"
→ Vérifier qu'aucun autre service n'utilise les ports 3001, 3002 ou 3003  
→ Modifier le port dans le fichier `.env` si nécessaire

### Erreur : "Cannot connect to observation-service"
→ Vérifier que l'observation-service est bien démarré  
→ Vérifier l'URL dans le `.env` du taxonomy-service

---

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
│
├── observation-service/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── jwt.js
│   │   ├── controllers/
│   │   │   ├── observation.controller.js
│   │   │   ├── species.controller.js
│   │   │   ├── admin.controller.js        # NOUVEAU
│   │   │   └── expert.controller.js       # NOUVEAU
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── observation.routes.js
│   │   │   ├── species.routes.js
│   │   │   ├── admin.routes.js            # NOUVEAU
│   │   │   └── expert.routes.js           # NOUVEAU
│   │   ├── services/
│   │   │   ├── observation.service.js
│   │   │   ├── species.service.js
│   │   │   └── admin.service.js           # NOUVEAU
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── taxonomy-service/                       # NOUVEAU SERVICE
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── jwt.js
│   │   ├── controllers/
│   │   │   └── taxonomy.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   └── taxonomy.routes.js
│   │   ├── services/
│   │   │   └── taxonomy.service.js
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── docker-compose.yml
├── init-db.sql
├── README.md
└── API_EXAMPLES.md
```

---

## 🎓 Niveau atteint : 16/20

### Fonctionnalités implémentées :

#### Niveau 10/20 (Base)
✅ 2 microservices fonctionnels (auth-service + observation-service)  
✅ Authentification JWT complète  
✅ Système de rôles (USER, EXPERT, ADMIN)  
✅ CRUD complet sur les espèces  
✅ Gestion des observations avec validation  
✅ Communication entre microservices  
✅ Toutes les règles métier de base  
✅ Architecture en service layers  
✅ Documentation complète

#### Niveau 16/20 (Avancé)
✅ **3ème microservice : taxonomy-service**  
✅ **Classification taxonomique des espèces**  
✅ **Génération de statistiques globales**  
✅ **Organisation en familles et branches évolutives**  
✅ **Extraction de mots-clés récurrents**  
✅ **Suppression logique (soft delete) des observations**  
✅ **Historisation complète des actions (CREATED, VALIDATED, REJECTED, DELETED, RESTORED)**  
✅ **GET /admin/user/:id/history - Historique complet d'un utilisateur**  
✅ **GET /expert/species/:id/history - Historique des validations d'une espèce**  
✅ **POST /admin/observations/:id/restore - Restauration d'observations supprimées**  
✅ **Respect strict des rôles pour toutes les actions de modération**

---

## 📦 Technologies utilisées

- **Express.js** : Framework web
- **Prisma** : ORM
- **PostgreSQL** : Base de données (3 instances)
- **JWT** : Authentification
- **bcryptjs** : Hash des mots de passe
- **axios** : Communication inter-services
- **Docker** : Conteneurisation de PostgreSQL

---

## 👨‍💻 Auteurs

- **Enzo Pace** - enzopc05
- **Rayane Menkar** - RayaneMkr

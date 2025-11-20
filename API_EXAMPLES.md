# 🚀 Exemples de requêtes API - DeepSea Archives

Guide pratique avec des exemples cURL pour tester l'API sans Postman.

## 🔐 Auth Service (Port 3001)

### 1. Inscription d'un utilisateur

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "username": "testuser",
    "password": "password123"
  }'
```

**Réponse attendue :**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "uuid-here",
    "email": "user@test.com",
    "username": "testuser",
    "role": "USER",
    "reputation": 0,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

### 2. Connexion

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "password123"
  }'
```

**Réponse attendue :**
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@test.com",
    "username": "testuser",
    "role": "USER",
    "reputation": 0
  }
}
```

**⚠️ Important :** Sauvegardez le token dans une variable :
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Récupérer son profil

```bash
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Lister tous les utilisateurs (ADMIN uniquement)

```bash
curl -X GET http://localhost:3001/auth/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Réponse attendue :**
```json
{
  "count": 3,
  "users": [
    {
      "id": "uuid-1",
      "email": "user@test.com",
      "username": "testuser",
      "role": "USER",
      "reputation": 0,
      "createdAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "email": "expert@test.com",
      "username": "expert",
      "role": "EXPERT",
      "reputation": 0,
      "createdAt": "2025-01-15T10:05:00.000Z"
    }
  ]
}
```

---

### 5. Modifier le rôle d'un utilisateur (ADMIN uniquement)

```bash
curl -X PATCH http://localhost:3001/auth/users/USER_ID/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "EXPERT"
  }'
```

**Rôles disponibles :** USER, EXPERT, ADMIN

---

### 6. Mettre à jour la réputation

```bash
curl -X PATCH http://localhost:3001/auth/users/USER_ID/reputation \
  -H "Content-Type: application/json" \
  -d '{
    "reputationChange": 5
  }'
```

---

### 7. Récupérer un utilisateur par ID

```bash
curl -X GET http://localhost:3001/auth/users/USER_ID
```

---

## 🐙 Observation Service (Port 3002)

### 1. Créer une espèce

```bash
curl -X POST http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kraken Abyssal",
    "description": "Créature tentaculaire gigantesque des profondeurs marines",
    "dangerLevel": 5
  }'
```

**Réponse attendue :**
```json
{
  "message": "Espèce créée avec succès",
  "species": {
    "id": "species-uuid",
    "authorId": "user-uuid",
    "name": "Kraken Abyssal",
    "description": "Créature tentaculaire gigantesque des profondeurs marines",
    "dangerLevel": 5,
    "createdAt": "2025-01-15T10:10:00.000Z"
  }
}
```

**⚠️ Important :** Sauvegardez l'ID de l'espèce :
```bash
export SPECIES_ID="species-uuid-here"
```

---

### 2. Lister toutes les espèces

```bash
curl -X GET http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse attendue :**
```json
{
  "count": 1,
  "species": [
    {
      "id": "species-uuid",
      "authorId": "user-uuid",
      "name": "Kraken Abyssal",
      "description": "Créature tentaculaire gigantesque...",
      "dangerLevel": 5,
      "createdAt": "2025-01-15T10:10:00.000Z",
      "observations": [
        {
          "id": "obs-uuid",
          "status": "VALIDATED",
          "description": "Observation validée..."
        }
      ]
    }
  ]
}
```

---

### 3. Récupérer une espèce par ID

```bash
curl -X GET http://localhost:3002/species/$SPECIES_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Créer une observation

```bash
curl -X POST http://localhost:3002/observations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "speciesId": "'$SPECIES_ID'",
    "description": "Spécimen observé à 4000 mètres de profondeur dans la fosse des Mariannes"
  }'
```

**Réponse attendue :**
```json
{
  "message": "Observation créée avec succès",
  "observation": {
    "id": "observation-uuid",
    "speciesId": "species-uuid",
    "authorId": "user-uuid",
    "description": "Spécimen observé à 4000 mètres...",
    "status": "PENDING",
    "validatedBy": null,
    "validatedAt": null,
    "createdAt": "2025-01-15T10:15:00.000Z",
    "species": {
      "id": "species-uuid",
      "name": "Kraken Abyssal"
    }
  }
}
```

**⚠️ Important :** Sauvegardez l'ID de l'observation :
```bash
export OBSERVATION_ID="observation-uuid-here"
```

---

### 5. Lister les observations d'une espèce

```bash
curl -X GET http://localhost:3002/species/$SPECIES_ID/observations \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse attendue :**
```json
{
  "count": 1,
  "observations": [
    {
      "id": "observation-uuid",
      "speciesId": "species-uuid",
      "authorId": "user-uuid",
      "description": "Spécimen observé à 4000 mètres...",
      "status": "PENDING",
      "validatedBy": null,
      "validatedAt": null,
      "createdAt": "2025-01-15T10:15:00.000Z"
    }
  ]
}
```

---

### 6. Valider une observation (EXPERT/ADMIN uniquement)

```bash
curl -X POST http://localhost:3002/observations/$OBSERVATION_ID/validate \
  -H "Authorization: Bearer $EXPERT_TOKEN"
```

**Réponse attendue :**
```json
{
  "message": "Observation validée avec succès",
  "observation": {
    "id": "observation-uuid",
    "speciesId": "species-uuid",
    "authorId": "user-uuid",
    "description": "Spécimen observé à 4000 mètres...",
    "status": "VALIDATED",
    "validatedBy": "expert-uuid",
    "validatedAt": "2025-01-15T10:20:00.000Z",
    "createdAt": "2025-01-15T10:15:00.000Z",
    "species": {
      "id": "species-uuid",
      "name": "Kraken Abyssal"
    }
  }
}
```

---

### 7. Rejeter une observation (EXPERT/ADMIN uniquement)

```bash
curl -X POST http://localhost:3002/observations/$OBSERVATION_ID/reject \
  -H "Authorization: Bearer $EXPERT_TOKEN"
```

---

## 🏥 Health Checks

### Auth Service

```bash
curl http://localhost:3001/health
```

**Réponse :**
```json
{
  "status": "OK",
  "service": "auth-service",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

### Observation Service

```bash
curl http://localhost:3002/health
```

**Réponse :**
```json
{
  "status": "OK",
  "service": "observation-service",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

---

## 🎯 Workflow complet en une seule session

```bash
#!/bin/bash

# 1. Créer un utilisateur
USER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","username":"testuser","password":"password123"}')
USER_ID=$(echo $USER_RESPONSE | jq -r '.user.id')

# 2. Se connecter
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}')
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

# 3. Créer une espèce
SPECIES_RESPONSE=$(curl -s -X POST http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kraken Abyssal","description":"Créature tentaculaire","dangerLevel":5}')
SPECIES_ID=$(echo $SPECIES_RESPONSE | jq -r '.species.id')

# 4. Créer une observation
OBSERVATION_RESPONSE=$(curl -s -X POST http://localhost:3002/observations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"speciesId":"'$SPECIES_ID'","description":"Observation à 4000m de profondeur"}')
OBSERVATION_ID=$(echo $OBSERVATION_RESPONSE | jq -r '.observation.id')

# 5. Afficher les résultats
echo "User ID: $USER_ID"
echo "Token: $TOKEN"
echo "Species ID: $SPECIES_ID"
echo "Observation ID: $OBSERVATION_ID"

# 6. Lister les espèces
curl -s -X GET http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Prérequis pour ce script :** Installer `jq` (JSON parser)
```bash
# Ubuntu/Debian
sudo apt install jq

# macOS
brew install jq

# Windows (avec Chocolatey)
choco install jq
```

---

## ❌ Exemples de cas d'erreur

### Créer une espèce avec un nom existant

```bash
curl -X POST http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kraken Abyssal",
    "description": "Tentative de duplication",
    "dangerLevel": 3
  }'
```

**Réponse attendue (400) :**
```json
{
  "error": "Une espèce avec ce nom existe déjà"
}
```

---

### DangerLevel invalide

```bash
curl -X POST http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Créature Test",
    "description": "Test avec niveau de danger invalide",
    "dangerLevel": 10
  }'
```

**Réponse attendue (400) :**
```json
{
  "error": "Le niveau de danger doit être compris entre 1 et 5"
}
```

---

### Valider sans être expert

```bash
curl -X POST http://localhost:3002/observations/$OBSERVATION_ID/validate \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Réponse attendue (403) :**
```json
{
  "error": "Accès réservé aux experts"
}
```

---

### Token manquant

```bash
curl -X GET http://localhost:3002/species
```

**Réponse attendue (401) :**
```json
{
  "error": "Token manquant"
}
```

---

## 📝 Notes importantes

1. **Remplacez les variables** : `USER_ID`, `SPECIES_ID`, `OBSERVATION_ID`, `TOKEN`, etc. par les vraies valeurs
2. **Format du token** : Toujours utiliser `Bearer TOKEN` dans le header Authorization
3. **Content-Type** : Toujours ajouter `application/json` pour les requêtes POST/PATCH
4. **Pretty print** : Ajoutez `| jq` à la fin pour formater le JSON (nécessite jq)
5. **Verbose mode** : Ajoutez `-v` pour voir les headers de réponse

---

## 🔧 Commandes utiles

### Voir les headers de réponse
```bash
curl -v http://localhost:3001/health
```

### Sauvegarder la réponse dans un fichier
```bash
curl http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN" \
  -o species.json
```

### Mesurer le temps de réponse
```bash
curl -w "\nTemps total: %{time_total}s\n" \
  http://localhost:3001/health
```

### Tester avec plusieurs requêtes
```bash
for i in {1..5}; do
  curl -s http://localhost:3001/health | jq '.timestamp'
  sleep 1
done
```
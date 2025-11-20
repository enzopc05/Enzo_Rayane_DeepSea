# 🚀 Exemples de requêtes API - DeepSea Archives

Guide pratique avec des exemples cURL pour tester l'API sans Postman.

---

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
    "description": "Créature tentaculaire géante des abysses",
    "dangerLevel": 5
  }'
```

**Réponse attendue :**
```json
{
  "message": "Espèce créée avec succès",
  "species": {
    "id": "uuid-here",
    "authorId": "user-uuid",
    "name": "Kraken Abyssal",
    "description": "Créature tentaculaire géante des abysses",
    "dangerLevel": 5,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

### 2. Lister toutes les espèces

```bash
curl -X GET http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Récupérer une espèce par ID

```bash
curl -X GET http://localhost:3002/species/SPECIES_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Créer une observation

```bash
curl -X POST http://localhost:3002/observations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "speciesId": "SPECIES_ID",
    "description": "Spécimen de 50 mètres observé à 4000m de profondeur, avec bioluminescence intense"
  }'
```

**Règle :** Impossible de créer 2 observations pour la même espèce en moins de 5 minutes.

---

### 5. Lister les observations d'une espèce

```bash
curl -X GET http://localhost:3002/species/SPECIES_ID/observations \
  -H "Authorization: Bearer $TOKEN"
```

---

### 6. Valider une observation (EXPERT/ADMIN uniquement)

```bash
curl -X POST http://localhost:3002/observations/OBSERVATION_ID/validate \
  -H "Authorization: Bearer $EXPERT_TOKEN"
```

**Réponse attendue :**
```json
{
  "message": "Observation validée avec succès",
  "observation": {
    "id": "obs-uuid",
    "status": "VALIDATED",
    "validatedBy": "expert-uuid",
    "validatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### 7. Rejeter une observation (EXPERT/ADMIN uniquement)

```bash
curl -X POST http://localhost:3002/observations/OBSERVATION_ID/reject \
  -H "Authorization: Bearer $EXPERT_TOKEN"
```

---

## 🔧 Admin Routes - Modération avancée (ADMIN uniquement)

### 8. Supprimer logiquement une observation

```bash
curl -X DELETE http://localhost:3002/admin/observations/OBSERVATION_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Contenu inapproprié ou spam"
  }'
```

**Réponse attendue :**
```json
{
  "message": "Observation supprimée avec succès",
  "observation": {
    "id": "obs-uuid",
    "status": "DELETED",
    "deletedBy": "admin-uuid",
    "deletedAt": "2025-01-15T11:00:00.000Z",
    "deletedReason": "Contenu inapproprié ou spam"
  }
}
```

**Note :** L'observation n'est pas réellement supprimée de la base de données, elle passe simplement au statut `DELETED`.

---

### 9. Restaurer une observation supprimée

```bash
curl -X POST http://localhost:3002/admin/observations/OBSERVATION_ID/restore \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Réponse attendue :**
```json
{
  "message": "Observation restaurée avec succès",
  "observation": {
    "id": "obs-uuid",
    "status": "PENDING",
    "deletedBy": null,
    "deletedAt": null,
    "deletedReason": null
  }
}
```

---

### 10. Historique complet d'un utilisateur

```bash
curl -X GET http://localhost:3002/admin/user/USER_ID/history \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Réponse attendue :**
```json
{
  "userId": "user-uuid",
  "stats": {
    "total": 15,
    "pending": 3,
    "validated": 10,
    "rejected": 1,
    "deleted": 1
  },
  "observations": [
    {
      "id": "obs-1",
      "description": "...",
      "status": "VALIDATED",
      "createdAt": "2025-01-10T10:00:00.000Z",
      "history": [
        {
          "action": "CREATED",
          "performedBy": "user-uuid",
          "performedByRole": "USER",
          "timestamp": "2025-01-10T10:00:00.000Z"
        },
        {
          "action": "VALIDATED",
          "performedBy": "expert-uuid",
          "performedByRole": "EXPERT",
          "previousStatus": "PENDING",
          "newStatus": "VALIDATED",
          "timestamp": "2025-01-11T09:00:00.000Z"
        }
      ]
    }
  ]
}
```

---

### 11. Liste des observations supprimées

```bash
curl -X GET http://localhost:3002/admin/observations/deleted \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Réponse attendue :**
```json
{
  "count": 3,
  "observations": [
    {
      "id": "obs-uuid",
      "description": "...",
      "status": "DELETED",
      "deletedBy": "admin-uuid",
      "deletedAt": "2025-01-14T10:00:00.000Z",
      "deletedReason": "Spam",
      "species": { "name": "Kraken Abyssal" }
    }
  ]
}
```

---

### 12. Historique d'une observation spécifique

```bash
curl -X GET http://localhost:3002/admin/observations/OBSERVATION_ID/history \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Réponse attendue :**
```json
{
  "observation": {
    "id": "obs-uuid",
    "description": "...",
    "status": "DELETED"
  },
  "history": [
    {
      "id": "history-1",
      "action": "CREATED",
      "performedBy": "user-uuid",
      "performedByRole": "USER",
      "previousStatus": null,
      "newStatus": "PENDING",
      "comment": "Observation créée",
      "timestamp": "2025-01-10T10:00:00.000Z"
    },
    {
      "id": "history-2",
      "action": "VALIDATED",
      "performedBy": "expert-uuid",
      "performedByRole": "EXPERT",
      "previousStatus": "PENDING",
      "newStatus": "VALIDATED",
      "comment": "Observation validée par un expert",
      "timestamp": "2025-01-11T09:00:00.000Z"
    },
    {
      "id": "history-3",
      "action": "DELETED",
      "performedBy": "admin-uuid",
      "performedByRole": "ADMIN",
      "previousStatus": "VALIDATED",
      "newStatus": "DELETED",
      "comment": "Contenu inapproprié",
      "timestamp": "2025-01-14T10:00:00.000Z"
    }
  ]
}
```

---

## 🧬 Expert Routes (EXPERT/ADMIN uniquement)

### 13. Historique des validations/rejets d'une espèce

```bash
curl -X GET http://localhost:3002/expert/species/SPECIES_ID/history \
  -H "Authorization: Bearer $EXPERT_TOKEN"
```

**Réponse attendue :**
```json
{
  "species": {
    "id": "species-uuid",
    "name": "Kraken Abyssal",
    "dangerLevel": 5
  },
  "stats": {
    "total": 12,
    "pending": 2,
    "validated": 8,
    "rejected": 1,
    "deleted": 1
  },
  "observations": [
    {
      "id": "obs-1",
      "description": "...",
      "status": "VALIDATED",
      "history": [
        {
          "action": "VALIDATED",
          "performedBy": "expert-uuid",
          "performedByRole": "EXPERT",
          "timestamp": "2025-01-11T09:00:00.000Z"
        }
      ]
    }
  ]
}
```

---

## 🧬 Taxonomy Service (Port 3003)

### 1. Statistiques taxonomiques globales

```bash
curl -X GET http://localhost:3003/taxonomy/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse attendue :**
```json
{
  "totalSpecies": 15,
  "totalObservations": 48,
  "avgObservationsPerSpecies": 3.2,
  "speciesClassification": [
    {
      "id": "species-uuid-1",
      "name": "Kraken Abyssal",
      "dangerLevel": 5,
      "totalObservations": 8,
      "validatedObservations": 6,
      "family": "Cephalopodes Géants",
      "subfamily": "Kraken",
      "evolutionBranch": "Prédateur Apex",
      "keywords": ["tentacules", "profondeur", "gigantesque", "bioluminescence"]
    },
    {
      "id": "species-uuid-2",
      "name": "Méduse Phosphorescente",
      "dangerLevel": 2,
      "totalObservations": 5,
      "validatedObservations": 4,
      "family": "Cnidaires Lumineux",
      "subfamily": "Méduse",
      "evolutionBranch": "Filtreur Passif",
      "keywords": ["lumineux", "transparent", "flottant"]
    }
  ],
  "keywords": [
    { "word": "profondeur", "occurrences": 23 },
    { "word": "bioluminescence", "occurrences": 18 },
    { "word": "tentacules", "occurrences": 15 },
    { "word": "gigantesque", "occurrences": 12 },
    { "word": "transparent", "occurrences": 10 }
  ]
}
```

**Fonctionnalités :**
- Nombre total d'espèces et d'observations
- Moyenne d'observations par espèce
- Classification hiérarchique complète
- Extraction des mots-clés les plus fréquents (avec filtrage des stopwords français)
- Organisation par niveau de danger

---

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

---

### Étape 2 : Se connecter et récupérer les tokens

**User :**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'
```
→ Sauvegarder le `token` dans `$TOKEN`

**Admin :**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```
→ Sauvegarder le `token` dans `$ADMIN_TOKEN`

**Expert :**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"expert@test.com","password":"expert123"}'
```
→ Sauvegarder le `token` dans `$EXPERT_TOKEN`

---

### Étape 3 : Promouvoir les rôles (avec le token admin)

**Promouvoir admin en ADMIN :**
```bash
curl -X PATCH http://localhost:3001/auth/users/{ID_ADMIN}/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

**Promouvoir expert en EXPERT :**
```bash
curl -X PATCH http://localhost:3001/auth/users/{ID_EXPERT}/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"EXPERT"}'
```

**⚠️ Important :** Reconnectez-vous après la promotion pour obtenir un nouveau token avec le bon rôle !

---

### Étape 4 : Créer une espèce (avec le token user)

```bash
curl -X POST http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Leviathan des Abysses",
    "description": "Créature gigantesque observée dans la fosse des Mariannes",
    "dangerLevel": 5
  }'
```

---

### Étape 5 : Créer une observation (avec le token user)

```bash
curl -X POST http://localhost:3002/observations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "speciesId": "{ID_SPECIES}",
    "description": "Spécimen de 50m observé à 4000m de profondeur avec tentacules bioluminescents"
  }'
```

---

### Étape 6 : Valider l'observation (avec le token expert)

```bash
curl -X POST http://localhost:3002/observations/{ID_OBSERVATION}/validate \
  -H "Authorization: Bearer $EXPERT_TOKEN"
```

---

### Étape 7 : Consulter l'historique de l'espèce (avec le token expert)

```bash
curl -X GET http://localhost:3002/expert/species/{ID_SPECIES}/history \
  -H "Authorization: Bearer $EXPERT_TOKEN"
```

---

### Étape 8 : Supprimer une observation (avec le token admin)

```bash
curl -X DELETE http://localhost:3002/admin/observations/{ID_OBSERVATION} \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Test de suppression logique"}'
```

---

### Étape 9 : Restaurer l'observation (avec le token admin)

```bash
curl -X POST http://localhost:3002/admin/observations/{ID_OBSERVATION}/restore \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Étape 10 : Consulter les statistiques taxonomiques (avec n'importe quel token)

```bash
curl -X GET http://localhost:3003/taxonomy/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💡 Conseils d'utilisation

1. **Remplacez les variables** : `USER_ID`, `SPECIES_ID`, `OBSERVATION_ID`, `TOKEN`, etc. par les vraies valeurs
2. **Format du token** : Toujours utiliser `Bearer TOKEN` dans le header Authorization
3. **Content-Type** : Toujours ajouter `application/json` pour les requêtes POST/PATCH/DELETE
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

---

## 🎯 Tests des nouvelles fonctionnalités niveau 16/20

### Test 1 : Cycle complet de modération

```bash
# 1. Créer une observation
OBS_ID=$(curl -s -X POST http://localhost:3002/observations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"speciesId":"SPECIES_ID","description":"Test"}' | jq -r '.observation.id')

# 2. La valider
curl -X POST http://localhost:3002/observations/$OBS_ID/validate \
  -H "Authorization: Bearer $EXPERT_TOKEN"

# 3. La supprimer
curl -X DELETE http://localhost:3002/admin/observations/$OBS_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Test de suppression"}'

# 4. Voir l'historique complet
curl -X GET http://localhost:3002/admin/observations/$OBS_ID/history \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 5. Restaurer
curl -X POST http://localhost:3002/admin/observations/$OBS_ID/restore \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### Test 2 : Statistiques taxonomiques avec plusieurs espèces

```bash
# Créer plusieurs espèces et observations
curl -X POST http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kraken","description":"Tentacules","dangerLevel":5}'

curl -X POST http://localhost:3002/species \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Méduse","description":"Bioluminescente","dangerLevel":2}'

# Créer des observations pour chaque espèce

# Consulter les statistiques
curl -X GET http://localhost:3003/taxonomy/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

Bon test ! 🚀
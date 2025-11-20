# 🧪 Guide de Tests - DeepSea Archives

## 📥 Importer la collection Postman

1. Ouvrir Postman
2. Cliquer sur **Import**
3. Sélectionner le fichier `DeepSea_Archives.postman_collection.json`
4. La collection sera importée avec tous les endpoints

## 🎯 Scénario de test complet (ordre recommandé)

### Phase 1 : Création des comptes

#### ✅ Test 1 : Créer un utilisateur normal
**Endpoint :** `Auth Service > 1. Register User`
**Résultat attendu :** Status 201, utilisateur créé avec role=USER

#### ✅ Test 2 : Créer un admin
**Endpoint :** `Auth Service > 2. Register Admin`
**Résultat attendu :** Status 201, utilisateur créé avec role=USER (sera promu plus tard)

#### ✅ Test 3 : Créer un expert
**Endpoint :** `Auth Service > 3. Register Expert`
**Résultat attendu :** Status 201, utilisateur créé avec role=USER (sera promu plus tard)

---

### Phase 2 : Connexion et récupération des tokens

#### ✅ Test 4 : Se connecter en tant qu'utilisateur
**Endpoint :** `Auth Service > 4. Login User`
**Résultat attendu :** Status 200, token reçu
**⚠️ Important :** Le token est automatiquement sauvegardé dans `{{user_token}}`

#### ✅ Test 5 : Se connecter en tant qu'admin
**Endpoint :** `Auth Service > 5. Login Admin`
**Résultat attendu :** Status 200, token reçu
**⚠️ Important :** Le token est automatiquement sauvegardé dans `{{admin_token}}`

#### ✅ Test 6 : Se connecter en tant qu'expert
**Endpoint :** `Auth Service > 6. Login Expert`
**Résultat attendu :** Status 200, token reçu
**⚠️ Important :** Le token est automatiquement sauvegardé dans `{{expert_token}}`

---

### Phase 3 : Promotion des rôles

#### ✅ Test 7 : Promouvoir admin en ADMIN
**Endpoint :** `Auth Service > 9. Promote Admin to ADMIN`
**Prérequis :** Avoir exécuté le Test 5 (Login Admin)
**Résultat attendu :** Status 200, role=ADMIN

**⚠️ Note :** Reconnectez-vous en tant qu'admin (Test 5) pour mettre à jour le token !

#### ✅ Test 8 : Promouvoir expert en EXPERT
**Endpoint :** `Auth Service > 10. Promote Expert to EXPERT`
**Prérequis :** Avoir un token admin valide
**Résultat attendu :** Status 200, role=EXPERT

**⚠️ Note :** Reconnectez-vous en tant qu'expert (Test 6) pour mettre à jour le token !

---

### Phase 4 : Création d'espèces

#### ✅ Test 9 : Créer une espèce
**Endpoint :** `Observation Service > Species > 1. Create Species`
**Prérequis :** Token utilisateur valide
**Résultat attendu :** Status 201, espèce créée
**⚠️ Important :** L'ID de l'espèce est sauvegardé dans `{{species_id}}`

#### ✅ Test 10 : Lister toutes les espèces
**Endpoint :** `Observation Service > Species > 2. Get All Species`
**Résultat attendu :** Status 200, liste des espèces

#### ✅ Test 11 : Récupérer une espèce par ID
**Endpoint :** `Observation Service > Species > 3. Get Species By ID`
**Résultat attendu :** Status 200, détails de l'espèce

---

### Phase 5 : Création d'observations

#### ✅ Test 12 : Créer une observation
**Endpoint :** `Observation Service > Observations > 1. Create Observation`
**Prérequis :** Avoir créé une espèce (Test 9)
**Résultat attendu :** Status 201, observation créée avec status=PENDING
**⚠️ Important :** L'ID de l'observation est sauvegardé dans `{{observation_id}}`

#### ✅ Test 13 : Lister les observations d'une espèce
**Endpoint :** `Observation Service > Observations > 2. Get Observations By Species`
**Résultat attendu :** Status 200, liste des observations

---

### Phase 6 : Validation des observations

#### ✅ Test 14 : Valider une observation (en tant qu'expert)
**Endpoint :** `Observation Service > Observations > 3. Validate Observation (Expert)`
**Prérequis :** 
- Avoir créé une observation (Test 12)
- Être connecté en tant qu'expert (Test 6 + Test 8)
**Résultat attendu :** Status 200, observation validée avec status=VALIDATED

---

## 🔍 Tests des règles métier

### Test A : Impossible de créer deux espèces avec le même nom
1. Créer une espèce "Kraken Abyssal" (Test 9)
2. Essayer de créer une autre espèce "Kraken Abyssal"
**Résultat attendu :** Status 400, erreur "Une espèce avec ce nom existe déjà"

### Test B : DangerLevel doit être entre 1 et 5
1. Créer une espèce avec `dangerLevel: 6`
**Résultat attendu :** Status 400, erreur "Le niveau de danger doit être compris entre 1 et 5"

### Test C : Description obligatoire
1. Créer une espèce sans le champ `description`
**Résultat attendu :** Status 400, erreur "La description est obligatoire"

### Test D : Impossible de soumettre 2 observations de la même espèce en < 5 minutes
1. Créer une observation pour une espèce (Test 12)
2. Immédiatement créer une autre observation pour la même espèce
**Résultat attendu :** Status 400, erreur "Vous avez déjà soumis une observation..."

### Test E : Impossible de valider sa propre observation
1. Créer une observation en tant qu'utilisateur
2. Promouvoir cet utilisateur en EXPERT
3. Essayer de valider sa propre observation
**Résultat attendu :** Status 400, erreur "Vous ne pouvez pas valider votre propre observation"

### Test F : Seuls les EXPERT/ADMIN peuvent valider
1. Créer une observation
2. Essayer de la valider avec un token USER
**Résultat attendu :** Status 403, erreur "Accès réservé aux experts"

### Test G : Une observation ne peut être traitée qu'une fois
1. Valider une observation
2. Essayer de la rejeter ensuite
**Résultat attendu :** Status 400, erreur "Cette observation a déjà été traitée"

---

## 🎨 Variables d'environnement Postman

Les variables suivantes sont automatiquement créées :

| Variable | Description |
|----------|-------------|
| `user_token` | Token JWT de l'utilisateur normal |
| `admin_token` | Token JWT de l'administrateur |
| `expert_token` | Token JWT de l'expert |
| `user_id` | ID de l'utilisateur normal |
| `admin_id` | ID de l'administrateur |
| `expert_id` | ID de l'expert |
| `species_id` | ID de la dernière espèce créée |
| `observation_id` | ID de la dernière observation créée |

---

## ⚠️ Conseils de test

1. **Respecter l'ordre des tests** : Certains tests dépendent des précédents
2. **Reconnexion après promotion** : Après avoir changé un rôle, reconnectez-vous pour obtenir un nouveau token
3. **Attendre 5 minutes** : Pour tester la règle des 5 minutes entre observations
4. **Vérifier les tokens** : S'assurer d'utiliser le bon token (user/admin/expert) pour chaque requête
5. **Lire les erreurs** : Les messages d'erreur sont explicites et vous guident

---

## 📊 Résultats attendus

### ✅ Tests qui doivent réussir (Status 2xx)
- Inscription des utilisateurs
- Connexion
- Promotion des rôles
- Création d'espèces
- Création d'observations
- Validation par un expert
- Récupération des profils
- Liste des utilisateurs (admin)

### ❌ Tests qui doivent échouer (Status 4xx)
- Créer une espèce avec un nom existant
- DangerLevel invalide
- Description manquante
- Deux observations de la même espèce en < 5 min
- Valider sa propre observation
- Valider sans être expert
- Traiter une observation déjà traitée

---

## 🐛 Dépannage

### Erreur 401 "Token manquant"
→ Vérifier que le header Authorization est bien présent
→ Format : `Bearer {{token_variable}}`

### Erreur 403 "Token invalide ou expiré"
→ Se reconnecter pour obtenir un nouveau token
→ Vérifier que le JWT_SECRET est identique dans les deux services

### Erreur 403 "Accès réservé aux..."
→ Vérifier que l'utilisateur a le bon rôle
→ Se reconnecter après une promotion de rôle

### Erreur 400 "Espèce non trouvée"
→ Vérifier que `{{species_id}}` est bien défini
→ Créer une espèce avant de créer une observation

### Erreur 404 "Observation non trouvée"
→ Vérifier que `{{observation_id}}` est bien défini
→ Créer une observation avant de la valider

---

## 📝 Checklist de validation

- [ ] Les 2 services démarrent sans erreur
- [ ] Health checks répondent OK
- [ ] Inscription fonctionne
- [ ] Connexion retourne un token
- [ ] Promotion de rôles fonctionne
- [ ] Création d'espèces fonctionne
- [ ] Nom unique d'espèce est vérifié
- [ ] DangerLevel est validé
- [ ] Description est obligatoire
- [ ] Création d'observations fonctionne
- [ ] Délai de 5 minutes est respecté
- [ ] Validation par expert fonctionne
- [ ] Auto-validation est bloquée
- [ ] Double validation est bloquée
- [ ] Accès expert est contrôlé

---

## 🎓 Niveau atteint

✅ **10/20** - Base complète avec toutes les fonctionnalités requises
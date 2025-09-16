# API Metro Paris - Dernier Metro

API REST pour aider les usagers nocturnes à savoir s'ils attraperont le dernier métro depuis une station donnée.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- Docker (optionnel)

### Installation locale

```bash
# Cloner le projet

cd apiexpress

# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

L'API sera disponible sur `http://localhost:3000`

### Avec Docker

```bash
# Construire l'image
npm run docker:build

# Lancer le conteneur
npm run docker:run

# Ou rebuild complet
npm run docker:rebuild
```

## 📋 Endpoints

### Health Check

```http
GET /health
```

**Réponse :**

```json
{
  "status": "ok"
}
```

### Informations Métro

```http
GET /next-metro?station=STATION_NAME
```

**Paramètres :**

- `station` (requis) : Nom de la station
- `time` (optionnel) : Heure simulée au format `HH:MM` pour les tests

**Réponse (service ouvert) :**

```json
{
  "station": "Chatelet",
  "line": "M1",
  "headwayMin": 3,
  "nextArrival": "12:34",
  "isLast": false,
  "tz": "Europe/Paris"
}
```

**Réponse (service fermé) :**

```json
{
  "service": "closed"
}
```

## ⏰ Règles de service

- **Service métro :** 05:30 → 01:15 (fictif pour le cours)
- **Fréquence :** 3 minutes pendant la plage de service
- **Dernières rames :** 00:45 → 01:15 (`isLast: true`)
- **Service fermé :** 01:15 → 05:30 (`service: "closed"`)

## 🧪 Tests

### Collection d'endpoints de test

Un fichier `endpoint-test.txt` est fourni avec **54 URLs de test** couvrant tous les scénarios :

- ✅ Health check
- ✅ Requêtes valides avec différentes stations
- ✅ Tests d'erreurs (400, 404)
- ✅ Simulation d'horaires (service normal, dernières rames, service fermé)
- ✅ Tests de validation des formats d'heure
- ✅ Tests limites des plages horaires

**Utilisation :**

```bash
# Copier une URL depuis endpoint-test.txt et la tester
curl "http://localhost:3000/next-metro?station=Chatelet&time=03:00"
```

### Exemples de tests manuels

#### Service normal

```bash
curl "http://localhost:3000/next-metro?station=Chatelet"
curl "http://localhost:3000/next-metro?station=Chatelet&time=10:00"
```

#### Dernières rames

```bash
curl "http://localhost:3000/next-metro?station=Chatelet&time=00:50"
curl "http://localhost:3000/next-metro?station=Chatelet&time=01:10"
```

#### Service fermé

```bash
curl "http://localhost:3000/next-metro?station=Chatelet&time=03:00"
curl "http://localhost:3000/next-metro?station=Chatelet&time=02:30"
```

#### Gestion d'erreurs

```bash
# Erreur 400 - Station manquante
curl "http://localhost:3000/next-metro"

# Erreur 404 - Route inexistante
curl "http://localhost:3000/invalid-route"
```

## 🐳 Scripts Docker

| Script                   | Description         |
| ------------------------ | ------------------- |
| `npm run docker:build`   | Construire l'image  |
| `npm run docker:run`     | Lancer le conteneur |
| `npm run docker:rebuild` | Stop + Build + Run  |

## 🏆 Défis Bonus Implémentés (3 points)

### 🔧 **Défi A - Variables d'environnement configurables (1 pt)**

**Ce que j'ai fait :**

- Ajouté 3 variables d'environnement configurables avec valeurs par défaut
- Rendu la fréquence des métros et les horaires de service modulables
- Intégré ces variables dans tous les calculs d'horaires

**Variables disponibles :**
| Variable | Description | Défaut |
|----------|-------------|---------|
| `HEADWAY_MIN` | Fréquence des métros (minutes) | `3` |
| `LAST_WINDOW_START` | Début dernières rames (HH:MM) | `00:45` |
| `SERVICE_END` | Fin de service (HH:MM) | `01:15` |

**Exemples de test :**

```bash
# Test 1: Métros toutes les 5 minutes
docker run --rm -p 3000:3000 -e HEADWAY_MIN=5 metro-api
curl "http://localhost:3000/next-metro?station=Chatelet"
# Résultat: "headwayMin": 5, horaires espacés de 5min

# Test 2: Dernières rames dès 00:40
docker run --rm -p 3000:3000 -e LAST_WINDOW_START=00:40 metro-api
curl "http://localhost:3000/next-metro?station=Chatelet&time=00:42"
# Résultat: "isLast": true (au lieu de false avec 00:45)
```

### 📊 **Défi B - N prochains passages (1 pt)**

**Ce que j'ai fait :**

- Étendu l'endpoint avec le paramètre `?n=X` pour retourner plusieurs horaires
- Conservé le format MVP pour `n=1` (ou absent) et créé un nouveau format pour `n>1`
- Limité `n` entre 1 et 5 avec validation d'erreur
- Calculé `isLast` individuellement pour chaque horaire

**Formats de réponse :**

_Format MVP (n=1 ou absent) :_

```json
{
  "station": "Chatelet",
  "line": "M1",
  "headwayMin": 3,
  "nextArrival": "12:34",
  "isLast": false,
  "tz": "Europe/Paris"
}
```

_Nouveau format (n>1) :_

```json
{
  "station": "Chatelet",
  "line": "M1",
  "headwayMin": 3,
  "tz": "Europe/Paris",
  "arrivals": [
    { "time": "12:34", "isLast": false },
    { "time": "12:37", "isLast": false },
    { "time": "12:40", "isLast": false }
  ]
}
```

**Exemples de test :**

```bash
# Test 1: Format MVP inchangé
curl "http://localhost:3000/next-metro?station=Chatelet"
# Résultat: Format original avec nextArrival

# Test 2: 3 prochains passages
curl "http://localhost:3000/next-metro?station=Chatelet&n=3"
# Résultat: Format avec arrivals[] contenant 3 horaires espacés de headwayMin
```

### 🔍 **Défi C - Validation stations + suggestions (1 pt)**

**Ce que j'ai fait :**

- Créé une liste de 10 stations valides avec leurs lignes
- Implémenté un système de suggestions par préfixe et substring
- Retourné des erreurs 404 avec suggestions pour les stations inconnues
- Géré les cas sans suggestions et la recherche insensible à la casse

**Stations valides :**
`Chatelet`, `République`, `Bastille`, `Nation`, `Opéra`, `Gare du Nord`, `Concorde`, `Louvre`, `Palais Royal`, `Tuileries`

**Logique de suggestions :**

1. **Préfixe** (priorité) : `"Chate"` → `["Chatelet"]`
2. **Substring** : `"Royal"` → `["Palais Royal"]`
3. **Aucune** : `"Zzz"` → `[]`

**Exemples de test :**

```bash
# Test 1: Station valide
curl "http://localhost:3000/next-metro?station=Chatelet"
# Résultat: 200 avec données métro normales

# Test 2: Station avec suggestions
curl "http://localhost:3000/next-metro?station=Chate"
# Résultat: 404 {"error": "unknown station", "suggestions": ["Chatelet"]}
```

## 🧪 **Collection de tests complète**

Un fichier `endpoint-test.txt` contient **182 URLs de test** couvrant :

- ✅ MVP original (69 tests)
- ✅ Défi A - Variables ENV (8 tests)
- ✅ Défi B - N passages (15 tests)
- ✅ Défi C - Validation stations (35 tests)
- ✅ Tests combinés (6 tests)
- ✅ Tests performance (5 tests)

## 🎯 **Validation des critères bonus**

### **Défi A ✅**

- `HEADWAY_MIN=5` → réponse avec `headwayMin: 5` et horaires espacés de 5min
- `LAST_WINDOW_START=00:40` → `isLast` devient `true` plus tôt

### **Défi B ✅**

- `n=3` → exactement 3 horaires espacés de `headwayMin`
- `n` absent → comportement MVP inchangé (1 seul horaire)
- Validation `n` entre 1 et 5

### **Défi C ✅**

- `station=Chate` → 404 avec suggestions contenant "Chatelet"
- `station=Zzz` → 404 avec `suggestions: []`
- Réponses strictement JSON, logs conservés

## 🚀 **Tests rapides des défis**

```bash
# Défi A: Variables ENV
docker run --rm -p 3000:3000 -e HEADWAY_MIN=5 -e LAST_WINDOW_START=00:40 metro-api
curl "http://localhost:3000/next-metro?station=Chatelet&time=00:42"

# Défi B: N passages
curl "http://localhost:3000/next-metro?station=Chatelet&n=3"

# Défi C: Suggestions
curl "http://localhost:3000/next-metro?station=Chate"
```

---

**Développé dans le cadre du TP EFREI - API Express + Docker + 3 Défis Bonus**

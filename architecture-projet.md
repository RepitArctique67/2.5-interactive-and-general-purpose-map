# 🌍 Plateforme Cartographique Globale - Architecture Technique

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture système](#architecture-système)
3. [Structure des dossiers](#structure-des-dossiers)
4. [Stack technologique](#stack-technologique)
5. [Modèle de données](#modèle-de-données)
6. [API Backend](#api-backend)
7. [Guide de développement](#guide-de-développement)
8. [Standards de code](#standards-de-code)

---

## Vue d'ensemble

### Objectif du projet
Créer une plateforme cartographique interactive permettant de visualiser des données géospatiales à travers le temps, avec des fonctionnalités collaboratives et une gestion multi-couches.

### Principes architecturaux
- **Modularité** : Chaque composant est indépendant et réutilisable
- **Scalabilité** : Architecture conçue pour gérer de grandes volumétries
- **Maintenabilité** : Code clair, documenté, testé
- **Performance** : Optimisation du rendu 3D et des requêtes spatiales
- **Open Source** : Technologie libre et collaborative

---

## Architecture système

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + CesiumJS)              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Globe 3D   │  │   Timeline   │  │  Layer Panel │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Search     │  │   Tools      │  │  User Panel  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (REST/GraphQL)                  │
├─────────────────────────────────────────────────────────────┤
│  Authentication │ Layers API │ Data API │ User API          │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │ Controllers  │  │  Middleware  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL + PostGIS)                 │
├─────────────────────────────────────────────────────────────┤
│  Spatial Data │ Timeline Data │ User Data │ Layer Config    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL DATA SOURCES                      │
├─────────────────────────────────────────────────────────────┤
│  OpenStreetMap │ NASA │ NOAA │ ESA │ IGN │ Natural Earth   │
└─────────────────────────────────────────────────────────────┘
```

---

## Structure des dossiers

```
plateforme-cartographique/
│
├── client/                          # Frontend React
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   │       ├── icons/
│   │       └── images/
│   │
│   ├── src/
│   │   ├── components/              # Composants React
│   │   │   ├── Globe/
│   │   │   │   ├── Globe.jsx
│   │   │   │   ├── Globe.styles.js
│   │   │   │   └── Globe.test.js
│   │   │   │
│   │   │   ├── Timeline/
│   │   │   │   ├── Timeline.jsx
│   │   │   │   ├── TimelineSlider.jsx
│   │   │   │   └── Timeline.styles.js
│   │   │   │
│   │   │   ├── LayerPanel/
│   │   │   │   ├── LayerPanel.jsx
│   │   │   │   ├── LayerItem.jsx
│   │   │   │   └── LayerToggle.jsx
│   │   │   │
│   │   │   ├── SearchBar/
│   │   │   ├── Tools/
│   │   │   └── UserPanel/
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useCesium.js
│   │   │   ├── useLayers.js
│   │   │   ├── useTimeline.js
│   │   │   └── useGeolocation.js
│   │   │
│   │   ├── services/                # Services API
│   │   │   ├── api.js              # Configuration Axios
│   │   │   ├── layerService.js
│   │   │   ├── dataService.js
│   │   │   └── authService.js
│   │   │
│   │   ├── store/                   # State management (Redux/Zustand)
│   │   │   ├── slices/
│   │   │   │   ├── layersSlice.js
│   │   │   │   ├── timelineSlice.js
│   │   │   │   └── userSlice.js
│   │   │   └── store.js
│   │   │
│   │   ├── utils/                   # Utilitaires
│   │   │   ├── cesiumHelpers.js
│   │   │   ├── geoUtils.js
│   │   │   └── dateHelpers.js
│   │   │
│   │   ├── config/                  # Configuration
│   │   │   ├── cesiumConfig.js
│   │   │   └── constants.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── styles/
│   │       └── global.css
│   │
│   ├── package.json
│   └── README.md
│
├── server/                          # Backend Node.js
│   ├── src/
│   │   ├── controllers/             # Contrôleurs
│   │   │   ├── layerController.js
│   │   │   ├── dataController.js
│   │   │   └── authController.js
│   │   │
│   │   ├── models/                  # Modèles de données
│   │   │   ├── Layer.js
│   │   │   ├── GeoData.js
│   │   │   ├── TimelineEvent.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/                  # Routes API
│   │   │   ├── layers.js
│   │   │   ├── data.js
│   │   │   ├── timeline.js
│   │   │   └── auth.js
│   │   │
│   │   ├── services/                # Logique métier
│   │   │   ├── layerService.js
│   │   │   ├── geoService.js
│   │   │   └── importService.js
│   │   │
│   │   ├── middleware/              # Middlewares
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── utils/                   # Utilitaires backend
│   │   │   ├── database.js
│   │   │   ├── logger.js
│   │   │   └── geoUtils.js
│   │   │
│   │   ├── config/                  # Configuration
│   │   │   ├── database.js
│   │   │   ├── server.js
│   │   │   └── external-apis.js
│   │   │
│   │   └── app.js                   # Point d'entrée
│   │
│   ├── tests/                       # Tests
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── package.json
│   └── README.md
│
├── database/                        # Scripts base de données
│   ├── migrations/
│   │   ├── 001_create_layers.sql
│   │   ├── 002_create_geodata.sql
│   │   ├── 003_create_timeline.sql
│   │   └── 004_create_users.sql
│   │
│   ├── seeds/                       # Données de test
│   │   ├── sample_layers.sql
│   │   └── sample_locations.sql
│   │
│   └── scripts/
│       ├── setup.sql
│       └── backup.sh
│
├── data-pipeline/                   # Pipeline d'importation de données
│   ├── importers/
│   │   ├── osmImporter.js
│   │   ├── nasaImporter.js
│   │   └── climateImporter.js
│   │
│   ├── processors/
│   │   ├── rasterToVector.js
│   │   └── aiProcessor.js
│   │
│   └── config/
│       └── sources.json
│
├── docs/                            # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
│
├── docker/                          # Configuration Docker
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── docker-compose.yml
│
├── .github/                         # CI/CD
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .env.example                     # Variables d'environnement
├── .gitignore
├── README.md
└── package.json
```

---

## Stack technologique

### Frontend
- **React 18** : Framework UI
- **CesiumJS 1.110** : Visualisation 3D du globe
- **Zustand** : State management léger
- **React Query** : Gestion des données asynchrones
- **Axios** : Client HTTP
- **Tailwind CSS** : Framework CSS utilitaire
- **Vite** : Build tool moderne

### Backend
- **Node.js 18+** : Runtime JavaScript
- **Express 4.18** : Framework web
- **PostgreSQL 15** : Base de données relationnelle
- **PostGIS 3.3** : Extension géospatiale
- **Sequelize** : ORM pour PostgreSQL
- **JWT** : Authentification
- **Winston** : Logging

### DevOps
- **Docker** : Conteneurisation
- **GitHub Actions** : CI/CD
- **Nginx** : Reverse proxy
- **PM2** : Process manager Node.js

### Outils de développement
- **ESLint** : Linting JavaScript
- **Prettier** : Formatage de code
- **Jest** : Tests unitaires
- **Cypress** : Tests E2E
- **Swagger** : Documentation API

---

## Modèle de données

### Schema PostgreSQL + PostGIS

#### Table : layers (Couches cartographiques)
```sql
CREATE TABLE layers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- 'base', 'terrain', 'imagery', 'data'
    category VARCHAR(100),       -- 'administrative', 'topographic', 'climate', etc.
    description TEXT,
    source_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_historical BOOLEAN DEFAULT false,
    min_year INT,
    max_year INT,
    zoom_min INT DEFAULT 0,
    zoom_max INT DEFAULT 22,
    opacity FLOAT DEFAULT 1.0,
    config JSONB,                -- Configuration spécifique (couleurs, symboles, etc.)
    metadata JSONB,              -- Métadonnées additionnelles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_layers_type ON layers(type);
CREATE INDEX idx_layers_category ON layers(category);
CREATE INDEX idx_layers_years ON layers(min_year, max_year);
```

#### Table : geo_features (Entités géographiques)
```sql
CREATE TABLE geo_features (
    id SERIAL PRIMARY KEY,
    layer_id INT REFERENCES layers(id) ON DELETE CASCADE,
    name VARCHAR(255),
    type VARCHAR(50),            -- 'point', 'line', 'polygon', 'multipolygon'
    geometry GEOMETRY(Geometry, 4326) NOT NULL,  -- PostGIS geometry
    properties JSONB,            -- Propriétés de l'entité
    valid_from DATE,             -- Début de validité temporelle
    valid_to DATE,               -- Fin de validité temporelle
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index spatial pour les requêtes géographiques
CREATE INDEX idx_geo_features_geometry ON geo_features USING GIST(geometry);
CREATE INDEX idx_geo_features_layer ON geo_features(layer_id);
CREATE INDEX idx_geo_features_dates ON geo_features(valid_from, valid_to);
```

#### Table : timeline_events (Événements historiques)
```sql
CREATE TABLE timeline_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_type VARCHAR(50),      -- 'political', 'natural', 'cultural', etc.
    location GEOMETRY(Point, 4326),
    related_layer_id INT REFERENCES layers(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timeline_date ON timeline_events(event_date);
CREATE INDEX idx_timeline_type ON timeline_events(event_type);
CREATE INDEX idx_timeline_location ON timeline_events USING GIST(location);
```

#### Table : users (Utilisateurs)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',  -- 'user', 'contributor', 'admin'
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### Table : user_contributions (Contributions utilisateurs)
```sql
CREATE TABLE user_contributions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    contribution_type VARCHAR(50),  -- 'add_feature', 'edit_feature', 'add_layer'
    entity_type VARCHAR(50),
    entity_id INT,
    data JSONB,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INT REFERENCES users(id)
);

CREATE INDEX idx_contributions_user ON user_contributions(user_id);
CREATE INDEX idx_contributions_status ON user_contributions(status);
```

---

## API Backend

### Architecture REST

```
Base URL: /api/v1
```

#### Endpoints principaux

**Layers (Couches)**
```
GET    /layers                    # Liste toutes les couches
GET    /layers/:id                # Détails d'une couche
POST   /layers                    # Créer une nouvelle couche (admin)
PUT    /layers/:id                # Modifier une couche (admin)
DELETE /layers/:id                # Supprimer une couche (admin)
GET    /layers/:id/features       # Entités d'une couche
GET    /layers/active             # Couches actives uniquement
```

**GeoData (Données géographiques)**
```
GET    /geodata                   # Requête spatiale
GET    /geodata/:id               # Détail d'une entité
POST   /geodata                   # Ajouter une entité (contributor)
PUT    /geodata/:id               # Modifier une entité (contributor)
DELETE /geodata/:id               # Supprimer une entité (admin)
GET    /geodata/bbox              # Données dans une bbox
GET    /geodata/near              # Données près d'un point
```

**Timeline (Ligne temporelle)**
```
GET    /timeline                  # Événements temporels
GET    /timeline/year/:year       # Événements d'une année
GET    /timeline/range            # Événements dans une période
POST   /timeline                  # Ajouter un événement (contributor)
```

**Search (Recherche)**
```
GET    /search                    # Recherche globale
GET    /search/geocode            # Géocodage (nom → coordonnées)
GET    /search/reverse-geocode    # Géocodage inverse (coord → nom)
```

**Auth (Authentification)**
```
POST   /auth/register             # Inscription
POST   /auth/login                # Connexion
POST   /auth/logout               # Déconnexion
GET    /auth/me                   # Profil utilisateur
PUT    /auth/me                   # Modifier profil
```

**Contributions**
```
GET    /contributions             # Mes contributions
POST   /contributions             # Soumettre une contribution
GET    /contributions/pending     # Contributions en attente (admin)
PUT    /contributions/:id/approve # Approuver (admin)
PUT    /contributions/:id/reject  # Rejeter (admin)
```

### Exemple de requête/réponse

**GET /api/v1/layers**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "OpenStreetMap",
      "type": "base",
      "category": "cartographic",
      "is_active": true,
      "is_historical": false,
      "opacity": 1.0,
      "config": {
        "url": "https://a.tile.openstreetmap.org/",
        "attribution": "© OpenStreetMap contributors"
      }
    },
    {
      "id": 2,
      "name": "Frontières historiques",
      "type": "data",
      "category": "administrative",
      "is_active": true,
      "is_historical": true,
      "min_year": 1900,
      "max_year": 2025,
      "opacity": 0.7
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "per_page": 50
  }
}
```

**GET /api/v1/geodata/bbox?bbox=2.2,48.8,2.5,48.9&year=1950**
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "id": 42,
        "geometry": {
          "type": "Point",
          "coordinates": [2.3522, 48.8566]
        },
        "properties": {
          "name": "Paris",
          "type": "city",
          "population": 2850000,
          "valid_from": "1900-01-01",
          "valid_to": null
        }
      }
    ]
  },
  "meta": {
    "count": 1,
    "bbox": [2.2, 48.8, 2.5, 48.9],
    "year": 1950
  }
}
```

---

## Guide de développement

### Installation locale

#### Prérequis
- Node.js 18+
- PostgreSQL 15+ avec PostGIS
- Docker (optionnel mais recommandé)
- Git

#### Configuration initiale

```bash
# Cloner le repository
git clone https://github.com/votre-org/plateforme-cartographique.git
cd plateforme-cartographique

# Installation des dépendances
npm install  # Root
cd client && npm install
cd ../server && npm install

# Configuration de l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Setup de la base de données
cd database
psql -U postgres -f scripts/setup.sql
npm run migrate  # Exécuter les migrations

# Lancer en mode développement
npm run dev  # Lance client + server en parallèle
```

#### Variables d'environnement (.env)

```env
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cartographie_db
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=7d

# Cesium
CESIUM_ION_TOKEN=your_cesium_token

# External APIs
NOMINATIM_URL=https://nominatim.openstreetmap.org
NASA_API_KEY=your_nasa_key
NOAA_API_KEY=your_noaa_key

# Client
VITE_API_URL=http://localhost:3001/api/v1
VITE_CESIUM_TOKEN=your_cesium_token
```

### Workflow Git

```bash
# Créer une branche feature
git checkout -b feature/nom-de-la-feature

# Développer et commiter régulièrement
git add .
git commit -m "feat: description claire"

# Pousser et créer une Pull Request
git push origin feature/nom-de-la-feature

# Après review, merger dans main
```

### Convention de commit (Conventional Commits)

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage, pas de changement de code
refactor: refactorisation
test: ajout de tests
chore: tâches de maintenance
```

---

## Standards de code

### JavaScript/React

```javascript
// ✅ BON : Composant fonctionnel avec hooks
import { useState, useEffect } from 'react';
import { useLayers } from '../hooks/useLayers';

/**
 * Composant LayerPanel
 * Affiche et gère la liste des couches cartographiques
 * 
 * @param {Object} props
 * @param {Function} props.onLayerToggle - Callback lors du toggle d'une couche
 */
export const LayerPanel = ({ onLayerToggle }) => {
  const { layers, loading, error } = useLayers();
  const [search, setSearch] = useState('');

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="layer-panel">
      <SearchInput value={search} onChange={setSearch} />
      {layers.map(layer => (
        <LayerItem 
          key={layer.id}
          layer={layer}
          onToggle={() => onLayerToggle(layer.id)}
        />
      ))}
    </div>
  );
};

// ✅ BON : Custom hook avec logique réutilisable
export const useLayers = () => {
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLayers = async () => {
      try {
        const response = await layerService.getAll();
        setLayers(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLayers();
  }, []);

  return { layers, loading, error };
};
```

### Node.js/Express

```javascript
// ✅ BON : Controller avec gestion d'erreurs
const layerController = {
  /**
   * Récupère toutes les couches
   * GET /api/v1/layers
   */
  async getAllLayers(req, res, next) {
    try {
      const { type, category, historical } = req.query;
      
      const filters = {
        ...(type && { type }),
        ...(category && { category }),
        ...(historical !== undefined && { is_historical: historical === 'true' })
      };

      const layers = await layerService.findAll(filters);
      
      res.json({
        success: true,
        data: layers,
        meta: {
          total: layers.length
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupère une couche par ID
   * GET /api/v1/layers/:id
   */
  async getLayerById(req, res, next) {
    try {
      const { id } = req.params;
      const layer = await layerService.findById(id);

      if (!layer) {
        return res.status(404).json({
          success: false,
          error: 'Layer not found'
        });
      }

      res.json({
        success: true,
        data: layer
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = layerController;
```

### SQL (PostGIS)

```sql
-- ✅ BON : Requête spatiale optimisée avec index
-- Trouver toutes les villes dans un rayon de 50km de Paris
SELECT 
    id,
    name,
    ST_AsGeoJSON(geometry) as geometry,
    properties,
    ST_Distance(
        geometry::geography,
        ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography
    ) / 1000 AS distance_km
FROM geo_features
WHERE 
    layer_id IN (SELECT id FROM layers WHERE category = 'cities')
    AND valid_from <= '2025-01-01'
    AND (valid_to IS NULL OR valid_to >= '2025-01-01')
    AND ST_DWithin(
        geometry::geography,
        ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography,
        50000  -- 50km en mètres
    )
ORDER BY distance_km
LIMIT 20;
```

### Tests

```javascript
// ✅ BON : Test unitaire avec Jest
import { renderHook, waitFor } from '@testing-library/react';
import { useLayers } from '../useLayers';
import { layerService } from '../../services/layerService';

jest.mock('../../services/layerService');

describe('useLayers hook', () => {
  it('should fetch layers successfully', async () => {
    const mockLayers = [
      { id: 1, name: 'OSM', type: 'base' },
      { id: 2, name: 'Terrain', type: 'terrain' }
    ];

    layerService.getAll.mockResolvedValue({ data: mockLayers });

    const { result } = renderHook(() => useLayers());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.layers).toEqual(mockLayers);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle errors', async () => {
    const errorMessage = 'Failed to fetch';
    layerService.getAll.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useLayers());

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.layers).toEqual([]);
    });
  });
});
```

---

## Prochaines étapes

### Phase 1 : Fondations (Mois 1-2)
- [ ] Setup complet de l'environnement de développement
- [ ] Configuration de la base de données PostgreSQL + PostGIS
- [ ] Création des migrations et seeds
- [ ] Setup du projet React + Vite
- [ ] Configuration CI/CD de base

### Phase 2 : API Backend (Mois 3-4)
- [ ] Implémentation des endpoints layers
- [ ] Implémentation des endpoints geodata
- [ ] Système d'authentification JWT
- [ ] Tests unitaires et d'intégration
- [ ] Documentation API avec Swagger

### Phase 3 : Frontend avancé (Mois 5-6)
- [ ] Refactorisation des composants en architecture modulaire
- [ ] Intégration du state management
- [ ] Amélioration de la timeline avec données réelles
- [ ] Système de couches multiples dynamiques
- [ ] Tests E2E avec Cypress

### Phase 4 : Données et intégrations (Mois 7-8)
- [ ] Pipeline d'importation OSM
- [ ] Intégration API NASA/NOAA
- [ ] Système de cache intelligent
- [ ] Optimisation des requêtes spatiales

### Phase 5 : Fonctionnalités avancées (Mois 9-10)
- [ ] Système collaboratif
- [ ] Module IA de contextualisation
- [ ] Gestion multi-niveaux (coupes verticales)
- [ ] Export de données

### Phase 6 : Tests et déploiement (Mois 11-12)
- [ ] Tests de charge et performance
- [ ] Sécurité et audit
- [ ] Documentation utilisateur
- [ ] Déploiement alpha en production

---

## Ressources et liens utiles

### Documentation technique
- [CesiumJS Documentation](https://cesium.com/learn/cesiumjs-learn/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [React Best Practices](https://react.dev/learn)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### APIs de données ouvertes
- [OpenStreetMap API](https://wiki.openstreetmap.org/wiki/API)
- [NASA Earth Data](https://earthdata.nasa.gov/)
- [NOAA Climate Data](https://www.ncei.noaa.gov/access)
- [Natural Earth Data](https://www.naturalearthdata.com/)
- [Nominatim Geocoding](https://nominatim.org/release-docs/latest/api/Overview/)

### Outils de développement
- [PostGIS Queries Examples](https://postgis.net/docs/reference.html)
- [GeoJSON Specification](https://geojson.org/)
- [Cesium Sandcastle](https://sandcastle.cesium.com/) - Pour tester des exemples
- [QGIS](https://qgis.org/) - Outil SIG pour visualiser/tester les données

---

## Patterns et bonnes pratiques

### 1. Gestion des erreurs

**Frontend**
```javascript
// services/api.js - Configuration Axios avec intercepteurs
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur de requête - Ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse - Gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erreur du serveur
      switch (error.response.status) {
        case 401:
          // Rediriger vers login
          window.location.href = '/login';
          break;
        case 403:
          console.error('Accès refusé');
          break;
        case 404:
          console.error('Ressource non trouvée');
          break;
        case 500:
          console.error('Erreur serveur');
          break;
        default:
          console.error('Erreur:', error.response.data.message);
      }
    } else if (error.request) {
      // Pas de réponse du serveur
      console.error('Serveur injoignable');
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Backend**
```javascript
// middleware/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack,
      details: err
    });
  } else {
    // Production - ne pas exposer les détails
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        success: false,
        error: 'Something went wrong'
      });
    }
  }
};

module.exports = { AppError, errorHandler };
```

### 2. Validation des données

```javascript
// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Validators pour les couches
const layerValidators = {
  create: [
    body('name').notEmpty().trim().isLength({ min: 3, max: 255 }),
    body('type').isIn(['base', 'terrain', 'imagery', 'data']),
    body('category').optional().trim().isLength({ max: 100 }),
    body('opacity').optional().isFloat({ min: 0, max: 1 }),
    body('min_year').optional().isInt({ min: 1000, max: 2100 }),
    body('max_year').optional().isInt({ min: 1000, max: 2100 }),
    validate
  ],

  update: [
    param('id').isInt(),
    body('name').optional().trim().isLength({ min: 3, max: 255 }),
    body('opacity').optional().isFloat({ min: 0, max: 1 }),
    validate
  ]
};

// Validators pour les requêtes spatiales
const geoValidators = {
  bbox: [
    query('bbox').custom((value) => {
      const coords = value.split(',').map(Number);
      if (coords.length !== 4) throw new Error('bbox doit contenir 4 coordonnées');
      if (coords.some(isNaN)) throw new Error('bbox doit contenir des nombres valides');
      if (coords[0] >= coords[2] || coords[1] >= coords[3]) {
        throw new Error('bbox invalide');
      }
      return true;
    }),
    query('year').optional().isInt({ min: 1000, max: 2100 }),
    validate
  ],

  near: [
    query('lon').isFloat({ min: -180, max: 180 }),
    query('lat').isFloat({ min: -90, max: 90 }),
    query('radius').optional().isInt({ min: 1, max: 1000000 }),
    validate
  ]
};

module.exports = { layerValidators, geoValidators };
```

### 3. Caching intelligent

```javascript
// services/cacheService.js
const NodeCache = require('node-cache');

class CacheService {
  constructor(ttlSeconds = 600) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl) {
    return this.cache.set(key, value, ttl || 600);
  }

  delete(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }

  // Cache avec fonction de récupération
  async wrap(key, fn, ttl) {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }
}

// Différents caches selon les besoins
const layerCache = new CacheService(3600); // 1h pour les couches
const geoCache = new CacheService(1800);   // 30min pour les données géo
const searchCache = new CacheService(600); // 10min pour les recherches

module.exports = { layerCache, geoCache, searchCache };

// Utilisation dans un controller
const layerController = {
  async getAllLayers(req, res, next) {
    try {
      const cacheKey = `layers:${JSON.stringify(req.query)}`;
      
      const layers = await layerCache.wrap(
        cacheKey,
        () => layerService.findAll(req.query),
        3600
      );

      res.json({ success: true, data: layers });
    } catch (error) {
      next(error);
    }
  }
};
```

### 4. Optimisation des requêtes PostGIS

```javascript
// services/geoService.js
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

class GeoService {
  /**
   * Récupère les features dans une bounding box avec optimisation
   */
  async getFeaturesInBbox(bbox, year = null, layerId = null) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    
    let query = `
      SELECT 
        gf.id,
        gf.name,
        gf.type,
        ST_AsGeoJSON(gf.geometry)::json as geometry,
        gf.properties,
        l.name as layer_name,
        l.category as layer_category
      FROM geo_features gf
      INNER JOIN layers l ON gf.layer_id = l.id
      WHERE 
        l.is_active = true
        AND gf.geometry && ST_MakeEnvelope($1, $2, $3, $4, 4326)
    `;

    const params = [minLon, minLat, maxLon, maxLat];
    let paramIndex = 5;

    // Filtre temporel
    if (year !== null) {
      query += ` AND (gf.valid_from IS NULL OR gf.valid_from <= ${paramIndex}::date)`;
      params.push(`${year}-12-31`);
      paramIndex++;
      
      query += ` AND (gf.valid_to IS NULL OR gf.valid_to >= ${paramIndex}::date)`;
      params.push(`${year}-01-01`);
      paramIndex++;
    }

    // Filtre par couche
    if (layerId) {
      query += ` AND gf.layer_id = ${paramIndex}`;
      params.push(layerId);
    }

    query += ` ORDER BY gf.layer_id, gf.id LIMIT 1000`;

    const result = await pool.query(query, params);
    
    return {
      type: 'FeatureCollection',
      features: result.rows.map(row => ({
        type: 'Feature',
        id: row.id,
        geometry: row.geometry,
        properties: {
          name: row.name,
          type: row.type,
          layer: row.layer_name,
          category: row.layer_category,
          ...row.properties
        }
      }))
    };
  }

  /**
   * Recherche des features proches d'un point
   */
  async getFeaturesNear(lon, lat, radiusMeters = 10000, limit = 20) {
    const query = `
      SELECT 
        gf.id,
        gf.name,
        gf.type,
        ST_AsGeoJSON(gf.geometry)::json as geometry,
        gf.properties,
        ST_Distance(
          gf.geometry::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance
      FROM geo_features gf
      INNER JOIN layers l ON gf.layer_id = l.id
      WHERE 
        l.is_active = true
        AND ST_DWithin(
          gf.geometry::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      ORDER BY distance
      LIMIT $4
    `;

    const result = await pool.query(query, [lon, lat, radiusMeters, limit]);
    
    return result.rows.map(row => ({
      ...row,
      distance: Math.round(row.distance),
      geometry: row.geometry
    }));
  }

  /**
   * Calcule les statistiques d'une zone
   */
  async getAreaStatistics(bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    
    const query = `
      WITH bbox AS (
        SELECT ST_MakeEnvelope($1, $2, $3, $4, 4326) as geom
      )
      SELECT 
        l.category,
        COUNT(*) as feature_count,
        ST_Area(ST_Union(gf.geometry)::geography) / 1000000 as total_area_km2
      FROM geo_features gf
      INNER JOIN layers l ON gf.layer_id = l.id
      CROSS JOIN bbox
      WHERE 
        l.is_active = true
        AND gf.geometry && bbox.geom
        AND gf.type IN ('polygon', 'multipolygon')
      GROUP BY l.category
      ORDER BY feature_count DESC
    `;

    const result = await pool.query(query, [minLon, minLat, maxLon, maxLat]);
    return result.rows;
  }
}

module.exports = new GeoService();
```

### 5. Custom hooks React avancés

```javascript
// hooks/useCesiumViewer.js
import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';

export const useCesiumViewer = (containerId, config = {}) => {
  const viewerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

      const viewer = new Cesium.Viewer(containerId, {
        terrainProvider: Cesium.createWorldTerrain(),
        imageryProvider: new Cesium.OpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/'
        }),
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        ...config
      });

      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.depthTestAgainstTerrain = true;

      viewerRef.current = viewer;
      setIsReady(true);
    } catch (err) {
      setError(err.message);
      console.error('Erreur initialisation Cesium:', err);
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [containerId]);

  return { viewer: viewerRef.current, isReady, error };
};

// hooks/useLayerManager.js
import { useState, useCallback } from 'react';
import { layerService } from '../services/layerService';

export const useLayerManager = (viewer) => {
  const [layers, setLayers] = useState([]);
  const [activeLayers, setActiveLayers] = useState(new Set());

  const loadLayers = useCallback(async () => {
    try {
      const response = await layerService.getAll();
      setLayers(response.data);
      
      // Activer les couches par défaut
      const defaultLayers = response.data.filter(l => l.is_active);
      setActiveLayers(new Set(defaultLayers.map(l => l.id)));
    } catch (error) {
      console.error('Erreur chargement couches:', error);
    }
  }, []);

  const toggleLayer = useCallback((layerId) => {
    setActiveLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
        // Retirer la couche de Cesium
        removeLayerFromViewer(viewer, layerId);
      } else {
        newSet.add(layerId);
        // Ajouter la couche à Cesium
        addLayerToViewer(viewer, layers.find(l => l.id === layerId));
      }
      return newSet;
    });
  }, [viewer, layers]);

  const addLayerToViewer = (viewer, layer) => {
    if (!viewer || !layer) return;

    switch (layer.type) {
      case 'imagery':
        viewer.imageryLayers.addImageryProvider(
          new Cesium.IonImageryProvider({ assetId: layer.config.assetId })
        );
        break;
      case 'terrain':
        viewer.scene.globe.enableLighting = true;
        break;
      // Ajouter d'autres types...
    }
  };

  const removeLayerFromViewer = (viewer, layerId) => {
    if (!viewer) return;
    // Logique de suppression selon le type
  };

  return {
    layers,
    activeLayers,
    loadLayers,
    toggleLayer
  };
};

// hooks/useGeoSearch.js
import { useState, useCallback } from 'react';
import { searchService } from '../services/searchService';

export const useGeoSearch = (viewer) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await searchService.geocode(query);
      setResults(response.data);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const flyToResult = useCallback((result) => {
    if (!viewer || !result) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        result.lon,
        result.lat,
        10000
      ),
      duration: 2
    });

    // Ajouter un marqueur
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(result.lon, result.lat),
      point: {
        pixelSize: 15,
        color: Cesium.Color.ORANGE,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3
      },
      label: {
        text: result.display_name,
        font: '16pt sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -15)
      }
    });
  }, [viewer]);

  return { results, loading, search, flyToResult };
};
```

### 6. Configuration Docker

```dockerfile
# docker/Dockerfile.server
FROM node:18-alpine

WORKDIR /app

# Installation des dépendances système
RUN apk add --no-cache python3 make g++

# Copie des fichiers package
COPY server/package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copie du code source
COPY server/ ./

# Exposition du port
EXPOSE 3001

# Commande de démarrage
CMD ["node", "src/app.js"]
```

```dockerfile
# docker/Dockerfile.client
FROM node:18-alpine as build

WORKDIR /app

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Production avec Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    container_name: cartographie_db
    environment:
      POSTGRES_DB: cartographie_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/scripts:/docker-entrypoint-initdb.d
    networks:
      - carto_network

  server:
    build:
      context: ..
      dockerfile: docker/Dockerfile.server
    container_name: cartographie_server
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: cartographie_db
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    networks:
      - carto_network

  client:
    build:
      context: ..
      dockerfile: docker/Dockerfile.client
    container_name: cartographie_client
    ports:
      - "80:80"
    depends_on:
      - server
    networks:
      - carto_network

volumes:
  postgres_data:

networks:
  carto_network:
    driver: bridge
```

---

## Sécurité

### Checklist de sécurité

- [ ] **Authentification forte** : JWT avec expiration courte + refresh tokens
- [ ] **Validation des entrées** : Toutes les entrées utilisateur doivent être validées
- [ ] **Protection CSRF** : Tokens CSRF pour les formulaires
- [ ] **Rate limiting** : Limiter le nombre de requêtes par IP/utilisateur
- [ ] **CORS configuré** : Autoriser uniquement les origines de confiance
- [ ] **SQL injection** : Utiliser des requêtes préparées (jamais de concaténation)
- [ ] **XSS protection** : Échapper tout contenu HTML fourni par l'utilisateur
- [ ] **HTTPS** : Toujours en production
- [ ] **Secrets sécurisés** : Variables d'environnement, jamais hardcodés
- [ ] **Logs sanitisés** : Ne jamais logger de mots de passe ou tokens
- [ ] **Mises à jour** : Dépendances régulièrement mises à jour

### Exemple de middleware de sécurité

```javascript
// middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const securityMiddleware = (app) => {
  // Headers de sécurité
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cesium.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "cesium.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "cesium.com", "nominatim.openstreetmap.org"]
      }
    }
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite par IP
    message: 'Trop de requêtes, réessayez plus tard'
  });
  app.use('/api/', limiter);

  // Sanitisation des données
  app.use(mongoSanitize());

  // Protection contre les injections NoSQL
  app.use(express.json({ limit: '10mb' }));
};

module.exports = securityMiddleware;
```

---

## Performance et monitoring

### Métriques à suivre

1. **Frontend**
   - Temps de chargement initial
   - FPS du rendu 3D
   - Taille des bundles JavaScript
   - Temps de réponse des API

2. **Backend**
   - Temps de réponse des endpoints
   - Taux d'erreur
   - Utilisation CPU/RAM
   - Nombre de connexions DB actives

3. **Base de données**
   - Temps d'exécution des requêtes
   - Utilisation des index
   - Taille de la base
   - Connexions simultanées

### Outils de monitoring recommandés

- **Frontend** : Lighthouse, Web Vitals, Sentry
- **Backend** : PM2, New Relic, DataDog
- **Database** : pg_stat_statements, pgAdmin
- **Logs** : Winston, LogTail, ELK Stack

---

## Conclusion

Cette architecture fournit une base solide, modulaire et scalable pour le développement de la plateforme cartographique. 

**Points clés** :
✅ Séparation claire frontend/backend
✅ Base de données optimisée pour le spatial
✅ API REST bien structurée
✅ Tests et documentation
✅ Sécurité intégrée
✅ Prêt pour le travail en équipe

**Contact et support** :
- Documentation : `/docs`
- Issues : GitHub Issues
- Discussions : GitHub Discussions
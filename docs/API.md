# API Documentation

## Overview

The 2.5D Interactive Map API provides RESTful endpoints for managing geospatial data, layers, timeline events, and user authentication. All endpoints return JSON responses and follow consistent patterns for error handling and data formatting.

**Base URL**: `http://localhost:3001/api/v1` (development)

**API Version**: v1

**Content-Type**: `application/json`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
   - [Layers API](#layers-api)
   - [Geospatial Data API](#geospatial-data-api)
   - [Timeline API](#timeline-api)
   - [Search API](#search-api)
   - [Authentication API](#authentication-api)
6. [Data Models](#data-models)

---

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication. Protected endpoints require a valid JWT token in the Authorization header.

### Obtaining a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### Using the Token

Include the token in the Authorization header for protected endpoints:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### User Roles

- **user**: Basic access, can view public data
- **contributor**: Can submit data contributions
- **admin**: Full access, can create/update/delete layers and approve contributions

---

## Response Format

All API responses follow a consistent structure:

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": { /* optional metadata */ }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* optional error details */ }
}
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Description |
|------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Codes

| Error Code | Description |
|-----------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DATABASE_ERROR` | Database operation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

### Example Error Response

```json
{
  "success": false,
  "error": "Layer not found",
  "code": "NOT_FOUND",
  "details": {
    "resource": "layer",
    "id": 999
  }
}
```

---

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **Anonymous users**: 100 requests per 15 minutes
- **Authenticated users**: 1000 requests per 15 minutes
- **Admin users**: 5000 requests per 15 minutes

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

---

## Endpoints

### Layers API

Manage map layers (base maps, terrain, imagery, data layers).

#### Get All Layers

Retrieve a list of all layers with optional filtering.

```http
GET /api/v1/layers
```

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `type` | string | Filter by layer type | `base`, `terrain`, `imagery`, `data` |
| `category` | string | Filter by category | `administrative`, `topographic`, `climate` |
| `is_active` | boolean | Filter active layers | `true`, `false` |
| `is_historical` | boolean | Filter historical layers | `true`, `false` |

**Example Request**:

```http
GET /api/v1/layers?type=base&is_active=true
```

**Example Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "OpenStreetMap",
      "type": "base",
      "category": "cartographic",
      "description": "OpenStreetMap base layer",
      "source_url": "https://a.tile.openstreetmap.org/",
      "is_active": true,
      "is_historical": false,
      "min_year": null,
      "max_year": null,
      "zoom_min": 0,
      "zoom_max": 22,
      "opacity": 1.0,
      "config": {
        "attribution": "© OpenStreetMap contributors"
      },
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Cesium World Terrain",
      "type": "terrain",
      "category": "topographic",
      "description": "High-resolution global terrain",
      "source_url": "https://assets.cesium.com/",
      "is_active": true,
      "is_historical": false,
      "opacity": 1.0,
      "config": {
        "requestVertexNormals": true
      },
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 2,
    "filters": ["type", "is_active"]
  }
}
```

---

#### Get Layer by ID

Retrieve detailed information about a specific layer.

```http
GET /api/v1/layers/:id
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Layer ID |

**Example Request**:

```http
GET /api/v1/layers/1
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "OpenStreetMap",
    "type": "base",
    "category": "cartographic",
    "description": "OpenStreetMap base layer",
    "source_url": "https://a.tile.openstreetmap.org/",
    "is_active": true,
    "is_historical": false,
    "min_year": null,
    "max_year": null,
    "zoom_min": 0,
    "zoom_max": 22,
    "opacity": 1.0,
    "config": {
      "attribution": "© OpenStreetMap contributors"
    },
    "metadata": {},
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Create Layer

Create a new map layer. **Requires admin authentication**.

```http
POST /api/v1/layers
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Historical Borders 1900",
  "type": "data",
  "category": "administrative",
  "description": "Political borders as of 1900",
  "source_url": "https://example.com/data/borders-1900.geojson",
  "is_active": true,
  "is_historical": true,
  "min_year": 1900,
  "max_year": 1950,
  "opacity": 0.7,
  "config": {
    "strokeColor": "#FF0000",
    "strokeWidth": 2,
    "fillColor": "#FF000033"
  }
}
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "Historical Borders 1900",
    "type": "data",
    "category": "administrative",
    "description": "Political borders as of 1900",
    "source_url": "https://example.com/data/borders-1900.geojson",
    "is_active": true,
    "is_historical": true,
    "min_year": 1900,
    "max_year": 1950,
    "zoom_min": 0,
    "zoom_max": 22,
    "opacity": 0.7,
    "config": {
      "strokeColor": "#FF0000",
      "strokeWidth": 2,
      "fillColor": "#FF000033"
    },
    "metadata": {},
    "created_at": "2025-11-20T18:00:00.000Z",
    "updated_at": "2025-11-20T18:00:00.000Z"
  },
  "message": "Couche créée avec succès"
}
```

---

#### Update Layer

Update an existing layer. **Requires admin authentication**.

```http
PUT /api/v1/layers/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body** (partial update supported):

```json
{
  "name": "Historical Borders 1900-1950",
  "opacity": 0.8,
  "is_active": false
}
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "Historical Borders 1900-1950",
    "opacity": 0.8,
    "is_active": false,
    "updated_at": "2025-11-20T18:30:00.000Z"
  },
  "message": "Couche mise à jour avec succès"
}
```

---

#### Delete Layer

Delete a layer. **Requires admin authentication**.

```http
DELETE /api/v1/layers/:id
Authorization: Bearer {token}
```

**Example Response**:

```json
{
  "success": true,
  "message": "Couche supprimée avec succès"
}
```

---

#### Get Layer Features

Retrieve geospatial features for a specific layer with optional filtering.

```http
GET /api/v1/layers/:id/features
```

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `bbox` | string | Bounding box (minLon,minLat,maxLon,maxLat) | `2.2,48.8,2.5,48.9` |
| `year` | integer | Filter by year (for historical data) | `1950` |

**Example Request**:

```http
GET /api/v1/layers/10/features?bbox=2.2,48.8,2.5,48.9&year=1920
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "layer": {
      "id": 10,
      "name": "Historical Borders 1900",
      "type": "data"
    },
    "features": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "id": 42,
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [2.3, 48.85],
                [2.4, 48.85],
                [2.4, 48.88],
                [2.3, 48.88],
                [2.3, 48.85]
              ]
            ]
          },
          "properties": {
            "name": "France",
            "type": "country",
            "valid_from": "1900-01-01",
            "valid_to": "1950-12-31"
          }
        }
      ]
    },
    "meta": {
      "count": 1,
      "bbox": [2.2, 48.8, 2.5, 48.9],
      "year": 1920
    }
  }
}
```

---

### Geospatial Data API

Query and manage geospatial features.

#### Query Geospatial Data

Retrieve geospatial data with spatial and temporal filtering.

```http
GET /api/v1/data
```

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `bbox` | string | Bounding box filter | `2.2,48.8,2.5,48.9` |
| `lat` | float | Latitude for proximity search | `48.8566` |
| `lon` | float | Longitude for proximity search | `2.3522` |
| `radius` | integer | Radius in meters (with lat/lon) | `50000` |
| `year` | integer | Filter by year | `1950` |
| `layer_id` | integer | Filter by layer | `10` |
| `type` | string | Feature type | `point`, `line`, `polygon` |
| `limit` | integer | Max results (default: 100) | `50` |

**Example Request**:

```http
GET /api/v1/data?lat=48.8566&lon=2.3522&radius=50000&year=1950
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "id": 123,
        "geometry": {
          "type": "Point",
          "coordinates": [2.3522, 48.8566]
        },
        "properties": {
          "name": "Paris",
          "type": "city",
          "population": 2850000,
          "layer_id": 5,
          "valid_from": "1900-01-01",
          "valid_to": null
        }
      }
    ]
  },
  "meta": {
    "count": 1,
    "center": [2.3522, 48.8566],
    "radius": 50000,
    "year": 1950,
    "limit": 100
  }
}
```

---

### Timeline API

Manage and query historical timeline events.

#### Get Timeline Events

Retrieve timeline events with optional filtering.

```http
GET /api/v1/timeline
```

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `start_date` | date | Start date (ISO 8601) | `1900-01-01` |
| `end_date` | date | End date (ISO 8601) | `2000-12-31` |
| `event_type` | string | Event type | `political`, `natural`, `cultural` |
| `bbox` | string | Bounding box filter | `2.2,48.8,2.5,48.9` |
| `limit` | integer | Max results | `50` |

**Example Request**:

```http
GET /api/v1/timeline?start_date=1900-01-01&end_date=1950-12-31&event_type=political
```

**Example Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Treaty of Versailles",
      "description": "Peace treaty signed after World War I",
      "event_date": "1919-06-28",
      "event_type": "political",
      "location": {
        "type": "Point",
        "coordinates": [2.3522, 48.8566]
      },
      "related_layer_id": 10,
      "metadata": {
        "participants": ["France", "Germany", "UK", "USA"],
        "significance": "high"
      },
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "count": 1,
    "date_range": {
      "start": "1900-01-01",
      "end": "1950-12-31"
    },
    "event_type": "political"
  }
}
```

---

### Search API

Search for locations and perform geocoding operations.

#### Search Locations

Perform a text search for locations.

```http
GET /api/v1/search
```

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `limit` | integer | No | Max results (default: 10) |

**Example Request**:

```http
GET /api/v1/search?q=Paris&limit=5
```

**Example Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Paris",
      "type": "city",
      "country": "France",
      "coordinates": [2.3522, 48.8566],
      "bbox": [2.2241, 48.8155, 2.4699, 48.9022],
      "relevance": 0.95
    }
  ],
  "meta": {
    "query": "Paris",
    "count": 1,
    "limit": 5
  }
}
```

---

#### Geocode

Convert an address to coordinates.

```http
GET /api/v1/search/geocode
```

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | Address to geocode |

**Example Request**:

```http
GET /api/v1/search/geocode?address=Eiffel Tower, Paris
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "address": "Eiffel Tower, Paris, France",
    "coordinates": [2.2945, 48.8584],
    "bbox": [2.2935, 48.8574, 2.2955, 48.8594],
    "components": {
      "name": "Eiffel Tower",
      "city": "Paris",
      "country": "France"
    }
  }
}
```

---

#### Reverse Geocode

Convert coordinates to an address.

```http
GET /api/v1/search/reverse-geocode
```

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | float | Yes | Latitude |
| `lon` | float | Yes | Longitude |

**Example Request**:

```http
GET /api/v1/search/reverse-geocode?lat=48.8584&lon=2.2945
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "coordinates": [2.2945, 48.8584],
    "address": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    "components": {
      "name": "Champ de Mars",
      "street": "Avenue Anatole France",
      "city": "Paris",
      "postal_code": "75007",
      "country": "France"
    }
  }
}
```

---

### Authentication API

User authentication and profile management.

#### Register

Create a new user account.

```http
POST /api/v1/auth/register
Content-Type: application/json
```

**Request Body**:

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 42,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2025-11-20T18:00:00.000Z"
    }
  },
  "message": "User registered successfully"
}
```

---

#### Login

Authenticate and receive a JWT token.

```http
POST /api/v1/auth/login
Content-Type: application/json
```

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 42,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

#### Get Current User

Retrieve the authenticated user's profile.

```http
GET /api/v1/auth/me
Authorization: Bearer {token}
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": 42,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "preferences": {
      "theme": "dark",
      "default_layer": "osm"
    },
    "created_at": "2025-11-20T18:00:00.000Z",
    "updated_at": "2025-11-20T18:00:00.000Z"
  }
}
```

---

#### Update Profile

Update the authenticated user's profile.

```http
PUT /api/v1/auth/me
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "username": "john_doe",
  "preferences": {
    "theme": "light",
    "default_layer": "satellite"
  }
}
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "id": 42,
    "username": "john_doe",
    "email": "john@example.com",
    "preferences": {
      "theme": "light",
      "default_layer": "satellite"
    },
    "updated_at": "2025-11-20T18:30:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

---

## Data Models

### Layer

```typescript
interface Layer {
  id: number;
  name: string;
  type: 'base' | 'terrain' | 'imagery' | 'data';
  category: string;
  description?: string;
  source_url?: string;
  is_active: boolean;
  is_historical: boolean;
  min_year?: number;
  max_year?: number;
  zoom_min: number;
  zoom_max: number;
  opacity: number;
  config: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

### GeoFeature

```typescript
interface GeoFeature {
  type: 'Feature';
  id: number;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][] | number[][][];
  };
  properties: {
    name?: string;
    type?: string;
    layer_id: number;
    valid_from?: string;
    valid_to?: string;
    [key: string]: any;
  };
}
```

### TimelineEvent

```typescript
interface TimelineEvent {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  event_type: 'political' | 'natural' | 'cultural' | 'economic';
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  related_layer_id?: number;
  metadata: Record<string, any>;
  created_at: string;
}
```

### User

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'contributor' | 'admin';
  is_active: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

---

## Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters**:

- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 50, max: 100)

**Response Meta**:

```json
{
  "meta": {
    "page": 1,
    "per_page": 50,
    "total": 150,
    "total_pages": 3
  }
}
```

---

## CORS

The API supports CORS for cross-origin requests. Allowed origins are configured in the server environment.

**Development**: `http://localhost:5173`
**Production**: Configured via `CLIENT_URL` environment variable

---

## Health Check

Check API health and status:

```http
GET /health
```

**Example Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-11-20T18:00:00.000Z",
  "uptime": 3600.5
}
```

---

## Support

For API support and questions:

- **GitHub Issues**: [Report issues](https://github.com/your-org/2.5d-map/issues)
- **Documentation**: [Full documentation](https://docs.example.com)
- **Email**: <support@example.com>

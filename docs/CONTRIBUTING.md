# Contributing Guide

Thank you for your interest in contributing to the 2.5D Interactive Map project! This guide will help you get started with development and contribution.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Architecture](#project-architecture)
5. [Development Workflow](#development-workflow)
6. [Code Style Guide](#code-style-guide)
7. [Testing Guidelines](#testing-guidelines)
8. [Commit Guidelines](#commit-guidelines)
9. [Pull Request Process](#pull-request-process)
10. [Contribution Types](#contribution-types)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting/derogatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ with **PostGIS** 3.3+ ([Installation Guide](https://postgis.net/install/))
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, but recommended) ([Download](https://www.docker.com/))

### Quick Start

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/2.5-interactive-and-general-purpose-map-2.git
cd 2.5-interactive-and-general-purpose-map-2

# 2. Install dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# 3. Set up environment variables
cd ..
cp .env.example .env
# Edit .env with your configuration

# 4. Set up the database (if using Docker)
docker-compose up -d postgres

# Or manually create the database
createdb cartographie_db
psql -d cartographie_db -c "CREATE EXTENSION postgis;"

# 5. Run database migrations
cd database
npm run migrate

# 6. Start development servers
cd ..
npm run dev
```

The application will be available at:

- **Frontend**: <http://localhost:5173>
- **Backend**: <http://localhost:3001>

---

## Development Setup

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cartographie_db
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRATION=7d

# Cesium Configuration
CESIUM_ION_TOKEN=your_cesium_ion_token

# External APIs (Optional)
NOMINATIM_URL=https://nominatim.openstreetmap.org
NASA_API_KEY=your_nasa_api_key
NOAA_API_KEY=your_noaa_api_key

# Client Configuration
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001/api/v1
VITE_CESIUM_TOKEN=your_cesium_ion_token
```

### Getting API Keys

#### Cesium Ion Token (Required)

1. Create a free account at [Cesium Ion](https://cesium.com/ion/)
2. Navigate to Access Tokens
3. Create a new token or use the default token
4. Add to your `.env` file

#### NASA API Key (Optional)

1. Register at [NASA API Portal](https://api.nasa.gov/)
2. Get your API key
3. Add to `.env` file

### Database Setup

#### Using Docker (Recommended)

```bash
# Start PostgreSQL with PostGIS
docker-compose up -d postgres

# Verify it's running
docker ps
```

#### Manual Setup

```bash
# Create database
createdb cartographie_db

# Enable PostGIS extension
psql -d cartographie_db -c "CREATE EXTENSION postgis;"

# Run migrations
cd database
psql -d cartographie_db -f migrations/001_create_layers.sql
psql -d cartographie_db -f migrations/002_create_geodata.sql
psql -d cartographie_db -f migrations/003_create_timeline.sql
psql -d cartographie_db -f migrations/004_create_users.sql

# Load sample data (optional)
psql -d cartographie_db -f seeds/sample_layers.sql
```

---

## Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + CesiumJS)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Globe 3D   │  │   Timeline   │  │  Layer Panel │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (REST)                          │
│  Authentication │ Layers API │ Data API │ Search API        │
└─────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js/Express)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │   Services   │  │  Middleware  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL + PostGIS)                 │
│  Spatial Data │ Timeline Data │ User Data │ Layers          │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
project-root/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── store/         # State management (Zustand)
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration
│   └── package.json
│
├── database/              # Database scripts
│   ├── migrations/        # SQL migration files
│   └── seeds/             # Sample data
│
├── docs/                  # Documentation
│   ├── API.md
│   ├── USER_GUIDE.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
│
└── docker-compose.yml     # Docker configuration
```

### Technology Stack

#### Frontend

- **React 19**: UI framework
- **CesiumJS 1.135**: 3D globe visualization
- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **Axios**: HTTP client
- **Vite**: Build tool and dev server

#### Backend

- **Node.js 18+**: Runtime
- **Express 5**: Web framework
- **PostgreSQL 15+**: Database
- **PostGIS 3.3+**: Spatial database extension
- **JWT**: Authentication
- **Winston**: Logging

#### DevOps

- **Docker**: Containerization
- **GitHub Actions**: CI/CD
- **ESLint**: Code linting
- **Prettier**: Code formatting

---

## Development Workflow

### Branch Strategy

We use **Git Flow** for branch management:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Creating a Feature

```bash
# 1. Update your local repository
git checkout develop
git pull origin develop

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# ... code, code, code ...

# 4. Commit your changes (see commit guidelines)
git add .
git commit -m "feat: add new layer management feature"

# 5. Push to your fork
git push origin feature/your-feature-name

# 6. Create a Pull Request on GitHub
```

### Running Development Servers

```bash
# Run both client and server concurrently
npm run dev

# Or run them separately:

# Terminal 1 - Frontend
cd client
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

---

## Code Style Guide

### JavaScript/React

We follow the **Airbnb JavaScript Style Guide** with some modifications.

#### General Principles

- Use **ES6+ features** (arrow functions, destructuring, async/await)
- Prefer **functional components** over class components
- Use **custom hooks** for reusable logic
- Keep components **small and focused**
- Write **self-documenting code** with clear variable names

#### React Component Example

```javascript
import { useState, useEffect } from 'react';
import { useLayers } from '../hooks/useLayers';

/**
 * LayerPanel component - Displays and manages map layers
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onLayerToggle - Callback when layer is toggled
 * @param {Function} props.onLayerOpacityChange - Callback when opacity changes
 * @returns {JSX.Element}
 */
export const LayerPanel = ({ onLayerToggle, onLayerOpacityChange }) => {
  const { layers, loading, error } = useLayers();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter layers based on search
  const filteredLayers = layers.filter(layer =>
    layer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="layer-panel">
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search layers..."
      />
      <LayerList
        layers={filteredLayers}
        onToggle={onLayerToggle}
        onOpacityChange={onLayerOpacityChange}
      />
    </div>
  );
};
```

#### Custom Hook Example

```javascript
import { useState, useEffect } from 'react';
import { layerService } from '../services/layerService';

/**
 * Custom hook for managing layers
 * 
 * @returns {Object} Layer state and operations
 */
export const useLayers = () => {
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLayers = async () => {
      try {
        setLoading(true);
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

  const toggleLayer = (layerId) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === layerId
          ? { ...layer, is_active: !layer.is_active }
          : layer
      )
    );
  };

  return { layers, loading, error, toggleLayer };
};
```

### Node.js/Express

#### Controller Example

```javascript
const layerService = require('../services/layerService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Layer controller - Handles layer-related HTTP requests
 */
const layerController = {
  /**
   * Get all layers with optional filtering
   * 
   * @async
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  async getAll(req, res, next) {
    try {
      const { type, category, is_active } = req.query;

      const filters = {
        ...(type && { type }),
        ...(category && { category }),
        ...(is_active !== undefined && { is_active: is_active === 'true' })
      };

      const layers = await layerService.findAll(filters);

      res.json({
        success: true,
        data: layers,
        meta: {
          total: layers.length,
          filters: Object.keys(filters)
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = layerController;
```

#### Service Example

```javascript
const db = require('../utils/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Layer service - Business logic for layers
 */
const layerService = {
  /**
   * Find all layers with optional filters
   * 
   * @async
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Array of layers
   */
  async findAll(filters = {}) {
    let query = 'SELECT * FROM layers WHERE 1=1';
    const params = [];

    if (filters.type) {
      params.push(filters.type);
      query += ` AND type = $${params.length}`;
    }

    if (filters.category) {
      params.push(filters.category);
      query += ` AND category = $${params.length}`;
    }

    if (filters.is_active !== undefined) {
      params.push(filters.is_active);
      query += ` AND is_active = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  },

  /**
   * Find layer by ID
   * 
   * @async
   * @param {number} id - Layer ID
   * @returns {Promise<Object>} Layer object
   * @throws {AppError} If layer not found
   */
  async findById(id) {
    const result = await db.query(
      'SELECT * FROM layers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Layer not found', 404, 'NOT_FOUND');
    }

    return result.rows[0];
  }
};

module.exports = layerService;
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Files** | camelCase | `layerController.js` |
| **Components** | PascalCase | `LayerPanel.jsx` |
| **Functions** | camelCase | `fetchLayers()` |
| **Constants** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **Classes** | PascalCase | `LayerService` |
| **Hooks** | camelCase with `use` prefix | `useLayers()` |

### Code Formatting

We use **Prettier** for automatic code formatting:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

**Prettier Configuration** (`.prettierrc`):

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid"
}
```

### Linting

We use **ESLint** for code quality:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

---

## Testing Guidelines

### Testing Philosophy

- **Write tests for all new features**
- **Maintain high code coverage** (target: 80%+)
- **Test behavior, not implementation**
- **Keep tests simple and readable**

### Test Structure

```
tests/
├── unit/              # Unit tests
│   ├── components/    # Component tests
│   ├── hooks/         # Hook tests
│   ├── services/      # Service tests
│   └── utils/         # Utility tests
│
├── integration/       # Integration tests
│   ├── api/          # API endpoint tests
│   └── database/     # Database tests
│
└── e2e/              # End-to-end tests
    └── user-flows/   # User journey tests
```

### Frontend Testing (Jest + React Testing Library)

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayerPanel } from '../LayerPanel';
import { layerService } from '../../services/layerService';

jest.mock('../../services/layerService');

describe('LayerPanel', () => {
  const mockLayers = [
    { id: 1, name: 'OSM', type: 'base', is_active: true },
    { id: 2, name: 'Terrain', type: 'terrain', is_active: false }
  ];

  beforeEach(() => {
    layerService.getAll.mockResolvedValue({ data: mockLayers });
  });

  it('renders layer list', async () => {
    render(<LayerPanel onLayerToggle={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('OSM')).toBeInTheDocument();
      expect(screen.getByText('Terrain')).toBeInTheDocument();
    });
  });

  it('calls onLayerToggle when layer is clicked', async () => {
    const onToggle = jest.fn();
    render(<LayerPanel onLayerToggle={onToggle} />);

    await waitFor(() => screen.getByText('OSM'));

    const toggleButton = screen.getByRole('button', { name: /toggle osm/i });
    await userEvent.click(toggleButton);

    expect(onToggle).toHaveBeenCalledWith(1);
  });
});
```

### Backend Testing (Jest)

```javascript
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/utils/database');

describe('Layers API', () => {
  beforeAll(async () => {
    // Set up test database
    await db.query('DELETE FROM layers');
  });

  afterAll(async () => {
    await db.end();
  });

  describe('GET /api/v1/layers', () => {
    it('returns all layers', async () => {
      const response = await request(app)
        .get('/api/v1/layers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('filters layers by type', async () => {
      const response = await request(app)
        .get('/api/v1/layers?type=base')
        .expect(200);

      expect(response.body.data.every(l => l.type === 'base')).toBe(true);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- LayerPanel.test.js
```

---

## Commit Guidelines

We follow **Conventional Commits** specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Examples

```bash
# Feature
git commit -m "feat(layers): add layer opacity control"

# Bug fix
git commit -m "fix(timeline): correct date parsing for historical events"

# Documentation
git commit -m "docs(api): update authentication examples"

# Breaking change
git commit -m "feat(api): redesign layer API

BREAKING CHANGE: Layer API endpoints have been restructured"
```

---

## Pull Request Process

### Before Submitting

1. ✅ **Update your branch** with the latest `develop`
2. ✅ **Run tests** and ensure they pass
3. ✅ **Run linter** and fix any issues
4. ✅ **Update documentation** if needed
5. ✅ **Add tests** for new features
6. ✅ **Test manually** in the browser

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by at least one maintainer
3. **Address feedback** and make requested changes
4. **Approval** from maintainer
5. **Merge** into `develop`

---

## Contribution Types

### 🐛 Bug Reports

**Before submitting**:

- Search existing issues
- Verify it's actually a bug
- Collect reproduction steps

**Include**:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos
- Browser/OS information
- Console errors

### ✨ Feature Requests

**Before submitting**:

- Check if feature already exists
- Search existing feature requests

**Include**:

- Clear use case
- Proposed solution
- Alternative solutions considered
- Mockups/examples (if applicable)

### 📝 Documentation

Documentation improvements are always welcome:

- Fix typos
- Clarify confusing sections
- Add examples
- Translate documentation

### 💻 Code Contributions

Areas where we need help:

- New data layers
- Performance optimizations
- UI/UX improvements
- Test coverage
- Accessibility improvements

---

## Getting Help

- **Documentation**: Check [docs/](../docs)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/2.5d-map/discussions)
- **Issues**: [GitHub Issues](https://github.com/your-org/2.5d-map/issues)
- **Chat**: Join our Discord (link in README)

---

## License

By contributing, you agree that your contributions will be licensed under the project's license (see [LICENSE](../LICENSE)).

---

**Thank you for contributing! 🎉**

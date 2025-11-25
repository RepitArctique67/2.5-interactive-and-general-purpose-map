# Product Roadmap

## Vision

To create an immersive, interactive 2.5D world map that visualizes data and history through time, enabling users to explore and gain insights from geospatial data.

## Strategic Goals

1. **Core Experience**: Deliver a smooth, performant 3D globe with basic layer capabilities.
2. **Data Richness**: Integrate diverse datasets (historical, climatic, administrative).
3. **User Engagement**: Provide intuitive tools for exploration, search, and contribution.
4. **Community**: Foster a community of contributors for data and features.

## User Stories & Backlog

### High Priority (Q1)

#### Core Visualization

- **US-101**: As a user, I want to view a 3D globe so that I can navigate the world.
  - *Acceptance Criteria*: CesiumJS globe renders, zoom/pan controls work, performance > 30fps.
- **US-102**: As a user, I want to toggle different map layers (satellite, terrain, political) so that I can customize my view.
  - *Acceptance Criteria*: Layer panel lists available layers, toggling updates globe immediately.

#### Timeline

- **US-201**: As a user, I want to change the year using a slider so that I can see how borders/data change over time.
  - *Acceptance Criteria*: Timeline slider exists, dragging updates "current year" state, layers refresh based on year.

#### Search

- **US-301**: As a user, I want to search for a city or country so that the camera flies to that location.
  - *Acceptance Criteria*: Search bar with autocomplete, selecting result animates camera to coordinates.

### Medium Priority (Q2)

#### Analytics & Data

- **US-401**: As a researcher, I want to click on a region to see detailed statistics (population, GDP) for the selected year.
  - *Acceptance Criteria*: Clicking a vector feature opens a popup/sidebar with data properties.
- **US-402**: As a user, I want to visualize data heatmaps (e.g., temperature) on the globe.
  - *Acceptance Criteria*: Support for raster/heatmap layers, legend display.

#### User Accounts

- **US-501**: As a user, I want to create an account so that I can save my favorite views/layers.
  - *Acceptance Criteria*: Registration/Login flow, "Saved Views" section in User Panel.

### Low Priority / Future (Q3+)

- **US-601**: As a contributor, I want to upload my own GeoJSON data so that I can share it with others.
- **US-602**: As a developer, I want an API to programmatically access map data.
- **US-603**: As a user, I want to annotate the map with markers and text.

## Sprint Planning

### Sprint 1 (Foundation)

- Setup React + CesiumJS project structure.
- Implement basic Globe component.
- Create Layer Store (Zustand).

### Sprint 2 (UI & Interaction)

- Implement Layer Panel UI.
- Implement Timeline Slider UI.
- Connect Timeline to global state.

### Sprint 3 (Data Integration)

- Connect PostGIS backend.
- Implement API for fetching vector tiles/GeoJSON.
- Basic Search functionality.

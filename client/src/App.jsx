import React, { useState, Suspense, useEffect, useMemo, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Globe from './components/Globe/Globe';
import LayerPanel from './components/LayerPanel/LayerPanel';
import Timeline from './components/Timeline/Timeline';
import SearchBar from './components/SearchBar/SearchBar';
import ToolsPanel from './components/Tools/ToolsPanel';
import UserPanel from './components/UserPanel/UserPanel';
import useLayers from './hooks/useLayers';
import useLayerData from './hooks/useLayerData';
import { trackPageView, trackEvent, trackError } from './utils/analytics';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
    trackError(error.toString(), true);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: 'red', color: 'white' }}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [currentYear, setCurrentYear] = useState(2025);
  const [activeLayerIds, setActiveLayerIds] = useState([]);

  // Fetch all layers metadata
  const { layers: allLayers, isLoading: layersLoading, error: layersError } = useLayers();

  useEffect(() => {
    trackPageView('/');
  }, []);

  const initializedRef = useRef(false);

  // Initialize active layers from metadata defaults
  useEffect(() => {
    if (!initializedRef.current && allLayers && allLayers.length > 0) {
      // Only set initial active state once
      const initialActive = allLayers.filter(l => l.is_active).map(l => l.id);
      if (initialActive.length > 0) {
        setActiveLayerIds(initialActive);
      }
      initializedRef.current = true;
    }
  }, [allLayers]);

  // Fetch data for active layers
  const { layerData } = useLayerData(allLayers, activeLayerIds, currentYear);

  // Prepare layers for Globe (merging metadata, active state, and fetched data)
  const globeLayers = useMemo(() => {
    if (!allLayers) return [];
    return allLayers.map(layer => {
      const data = layerData.find(d => d.id === layer.id);
      const isActive = activeLayerIds.includes(layer.id);
      return {
        ...layer,
        visible: isActive,
        geojsonData: data ? data.geojsonData : null,
        // Pass styling options if they exist in config
        strokeColor: layer.config?.strokeColor,
        fillColor: layer.config?.fillColor,
      };
    });
  }, [allLayers, layerData, activeLayerIds]);

  // Prepare layers for Panel (updating is_active status)
  const panelLayers = useMemo(() => {
    if (!allLayers) return [];
    return allLayers.map(layer => ({
      ...layer,
      is_active: activeLayerIds.includes(layer.id)
    }));
  }, [allLayers, activeLayerIds]);

  const handleLayerToggle = (layerId) => {
    console.log('Toggle layer:', layerId);
    trackEvent('Layer', 'Toggle', `Layer ${layerId}`);
    setActiveLayerIds(prev => {
      if (prev.includes(layerId)) {
        return prev.filter(id => id !== layerId);
      } else {
        return [...prev, layerId];
      }
    });
  };

  const handleYearChange = (year) => {
    setCurrentYear(year);
    console.log('Year changed to:', year);
    trackEvent('Timeline', 'Change Year', `${year}`);
  };

  // Handle entity interactions
  const handleEntityClick = (entity) => {
    console.log('Clicked entity:', entity);
    trackEvent('Globe', 'Click Entity', entity.name || 'Unknown');
  };

  const handleLocationSelect = (location) => {
    console.log('Location selected:', location);
    // TODO: Fly to location on Globe
    trackEvent('Search', 'Select Location', location.name);
  };

  return (
    <div className="app-container relative">
      <ErrorBoundary>
        <Suspense fallback={<div className="loading-overlay">Loading 3D Globe...</div>}>
          <Globe
            layers={globeLayers}
            currentYear={currentYear}
            onEntityClick={handleEntityClick}
            enableLighting={true}
            enableShadows={true}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Top Bar */}
      <SearchBar onLocationSelect={handleLocationSelect} />
      <UserPanel />

      {/* Side Panels */}
      <LayerPanel
        layers={panelLayers}
        onLayerToggle={handleLayerToggle}
        isLoading={layersLoading}
        error={layersError}
      />
      <ToolsPanel />

      {/* Bottom Controls */}
      <Timeline
        currentYear={currentYear}
        onYearChange={handleYearChange}
        minYear={1900}
        maxYear={2025}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;

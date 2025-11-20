import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Globe from './components/Globe/Globe';
import LayerPanel from './components/LayerPanel/LayerPanel';
import Timeline from './components/Timeline/Timeline';
import useLayers from './hooks/useLayers';
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

function AppContent() {
  const [currentYear, setCurrentYear] = useState(2025);
  const { layers, isLoading, error } = useLayers();

  const handleLayerToggle = (layerId) => {
    console.log('Toggle layer:', layerId);
    // TODO: Implement layer toggle logic with Cesium
  };

  const handleYearChange = (year) => {
    setCurrentYear(year);
    console.log('Year changed to:', year);
    // TODO: Update layers based on year
  };

  return (
    <div className="app-container">
      <Globe />
      <LayerPanel
        layers={layers}
        onLayerToggle={handleLayerToggle}
        isLoading={isLoading}
        error={error}
      />
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

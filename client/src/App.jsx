import React, { useState, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import Globe from './components/Globe/Globe';
const Globe = React.lazy(() => import('./components/Globe/Globe'));
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
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
  const { layers, isLoading, error } = useLayers();

  const handleLayerToggle = (layerId) => {
    console.log('Toggle layer:', layerId);
  };

  const handleYearChange = (year) => {
    setCurrentYear(year);
    console.log('Year changed to:', year);
  };

  return (
    <div className="app-container">
      <ErrorBoundary>
        <Suspense fallback={<div className="loading-overlay">Loading 3D Globe...</div>}>
          <Globe />
        </Suspense>
      </ErrorBoundary>
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

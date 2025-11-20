import React from 'react';
import { Viewer } from 'resium';
import { Cartesian3 } from 'cesium';

function App() {
  return (
    <div className="w-full h-screen">
      <Viewer full />
    </div>
  );
}

export default App;

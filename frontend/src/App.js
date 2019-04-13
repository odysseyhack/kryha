import React, { Component, useState } from 'react';
import Universe from './scenes/universe';
import Logo from './components/logo';
import Controls from './components/controls';

function App() {
  const [showRegions, setShowRegions] = useState(false);
  return (
    <React.Fragment>
      <Logo />
      <Controls showRegions={showRegions} setShowRegions={setShowRegions} />
      <Universe showRegions={showRegions} />
    </React.Fragment>
  );
}

export default App;

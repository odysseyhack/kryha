import React, { Component, useState, useRef } from 'react';
import Universe from './scenes/universe';
import Logo from './components/logo';
import Controls from './components/controls';

function App() {
  const [showRegions, setShowRegions] = useState(false);
  let universe = useRef();
  return (
    <React.Fragment>
      <Logo />
      <Controls showRegions={showRegions} setShowRegions={setShowRegions} />
      <Universe ref={universe} showRegions={showRegions} />
    </React.Fragment>
  );
}

export default App;

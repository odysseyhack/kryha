import React, { Component, useState, useRef } from 'react';
import Universe from './scenes/universe';
import Logo from './components/logo';
import Controls from './components/controls';
import Stats from './components/stats';

function App() {
  const [showRegions, setShowRegions, showDrones, setShowDrones] = useState(false);
  let universe = useRef();
  return (
    <React.Fragment>
      <Logo />
      <Controls showRegions={showRegions} setShowRegions={setShowRegions} showDrones={showDrones} setShowDrones={setShowDrones} />
      <Universe ref={universe} showRegions={showRegions} showDrones={showDrones} />
    </React.Fragment>
  );
}

export default App;

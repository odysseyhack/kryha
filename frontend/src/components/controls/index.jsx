import React from 'react';
import './index.css';

function Controls({ showRegions, setShowRegions }) {
  return (
    <div className="Controls">
      <button onClick={() => setShowRegions(!showRegions)}>
        {showRegions ? 'Unshow region states' : 'Show region states'}
      </button>
    </div>
  )
}

export default Controls;

import React, { Component } from 'react';
import Universe from './scenes/universe';
import Logo from './components/logo';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Logo />
        <Universe />
      </div>
    );
  }
}

export default App;

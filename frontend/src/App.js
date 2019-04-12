import React, { Component } from 'react';
import Universe from './scenes/universe';
import Logo from './components/logo';

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Logo />
        <Universe />
      </React.Fragment>
    );
  }
}

export default App;

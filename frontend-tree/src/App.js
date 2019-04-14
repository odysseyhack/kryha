import React, { Component } from 'react';
import Tree from 'react-d3-tree';
import set from 'lodash/set';
import get from 'lodash/get';
import cx from 'classnames';
import concat from 'lodash/concat';
import takeRight from 'lodash/takeRight';
import cloneDeep from 'lodash/cloneDeep';
import './App.css';

const treeData = [
  {
    address: 'Top Level',
    children: [
      {
        address: 'Level 2: A',
      },
      {
        name: 'Level 2: B',
      },
    ],
  },
];

function Logo() {
  return (
    <div className="Logo">horizon</div>
  );
}



class NodeLabel extends React.PureComponent {
  render() {
    const {className, nodeData} = this.props
    const classes = cx(className, {
      'alive': nodeData.alive,
      'dead': !nodeData.alive,
    });
    return (
      <div className={classes}>
        <div className="wrapper">
          <div className="name">{nodeData.address}</div>
          {nodeData.dna && nodeData.dna.length > 0 &&
          (
            <div className="data">
              <div className="dna"><div className="title">DNA</div><div>{nodeData.dna[0].substring(0, 30)}</div></div>
            </div>
          )}
        </div>
        {/* {nodeData._children && 
          <button>{nodeData._collapsed ? 'Expand' : 'Collapse'}</button>
        } */}
      </div>
    )
  }
}

function convertToTreeData(drones, keyPaths, data) {
  // return drones;
  const newDrones = [...drones];
  // const newKeyPaths = {...keyPaths};
  // const addressesInKeyPaths = Object.keys(keyPaths);
  for (let i = 0; i < data.length; i++) {
    const drone = data[i];
    const addressesInKeyPaths = Object.keys(keyPaths);
    if (addressesInKeyPaths.includes(drone.address)) {
      continue;
    }
    if (addressesInKeyPaths.includes(drone.parent1)) {
      const idx = get(drones, concat(keyPaths[drone.parent1], 'children')).length;
      // if (idx > 10) continue;
      const keyPath = concat(keyPaths[drone.parent1], 'children', idx);
      set(newDrones, keyPath, { ...drone, children: [] });
      keyPaths[drone.address] = keyPath;
      continue;
    }
  }
  return [newDrones, keyPaths];
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastCount: 0,
      keyPaths: { "0x0000000000000000000000000000000000000000": [0] },
      drones: [{ address: "0x0000000000000000000000000000000000000000", children: [] }],
    };
    this.fetchData();
    this.fetchInterval = setInterval(() => this.fetchData(), 3000);
  }

  fetchData() {
    fetch('http://13.80.136.159:9001/drone/').then((response) => {
        return response.json();
      }).then((data) => {
        const newData = takeRight(data, data.length - this.state.lastCount);
        const [drones, keyPaths] = convertToTreeData(this.state.drones, this.state.keyPaths, newData);
        this.setState({ drones, keyPaths, lastCount: data.length });
      })
  }

  render() {
    return (
      <div className="App">
        <Logo />
        {
            <Tree
            data={this.state.drones}
            transitionDuration={0}
            allowForeignObjects
            nodeLabelComponent={{
              render: <NodeLabel className='Drone' />,
              foreignObjectWrapper: {
                y: -25,
                x: -1
              }
            }}
            translate={{ x: 516.925, y: 469.5 }}
            nodeSize={{ x: 800, y: 140 }}
            nodeSvgShape={{shape: 'square', shapeProps: {r: 1}}}
            // textLayout={{textAnchor: "start", x: 20, y: -10, transform: undefined }}
            styles={{
              links: { stroke: '#465756', strokeWidth: 1 },
              nodes: {
                node: {
                  circle: {
                    fill: '#32434a',
                    stroke: '#849ea7',
                  },
                  name: {
                    fill: '#6aefe9',
                    stroke: '#2b807c',
                    'stroke-width': 1,
                  }
                },    
              }
            }}
          />
        }
      </div>
    );
  }
}

export default App;

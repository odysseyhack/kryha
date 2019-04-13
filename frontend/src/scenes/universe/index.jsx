import * as THREE from 'three/src/Three';
import React, { useState, useEffect, useRef, useMemo } from 'react';
// A THREE.js React renderer, see: https://github.com/drcmda/react-three-fiber
import { Canvas, useRender, useThree } from 'react-three-fiber';
// A React animation lib, see: https://github.com/react-spring/react-spring
import { useSpring, animated } from 'react-spring/three';
import OrbitControls from 'three-orbitcontrols';
import max from 'lodash/max';
import './index.css';


// function Octahedron() {
//   const [active, setActive] = useState(false)
//   const [hovered, setHover] = useState(false)
//   const vertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
//   const { color, pos, ...props } = useSpring({
//     color: active ? 'hotpink' : 'white',
//     pos: active ? [0, 0, 2] : [0, 0, 0],
//     'material-opacity': hovered ? 0.6 : 0.25,
//     scale: active ? [1.5, 1.5, 1.5] : [1, 1, 1],
//     rotation: active ? [THREE.Math.degToRad(180), 0, THREE.Math.degToRad(45)] : [0, 0, 0],
//     config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 }
//   })
//   return (
//     <group>
//       <animated.line position={pos}>
//         <geometry attach="geometry" vertices={vertices.map(v => new THREE.Vector3(...v))} />
//         <animated.lineBasicMaterial attach="material" color={color} />
//       </animated.line>
//       <animated.mesh onClick={e => setActive(!active)} onPointerOver={e => setHover(true)} onPointerOut={e => setHover(false)} {...props}>
//         <octahedronGeometry attach="geometry" />
//         <meshStandardMaterial attach="material" color="grey" transparent />
//       </animated.mesh>
//     </group>
//   )
// }

/**
 * Generate the initial data texture of given `size` by adding
 * random colors at each x,y position.
 * @param {*} data 
 * @param {*} size 
 */
function createData(data, size) {
  for ( var i = 0; i < size; i ++ ) {
    var stride = i * 3;

    var r = Math.floor( Math.random() * 255 );
    var g = Math.floor( Math.random() * 255 );
    var b = Math.floor( Math.random() * 255 );

    data[ stride ] = r;
    data[ stride + 1 ] = g;
    data[ stride + 2 ] = b;
  }
}

/**
 * Fetch world state data.
 */
async function fetchWorldState() {
  try {
    const data = await fetch('http://localhost:9001/world/');
    const json = await data.json();
    return json;
  } catch {
    console.log('error');
    return null;
  }
  return null;
}

const COLORS = {
  air: new THREE.Color('white'),
  water: new THREE.Color('blue'),
  resources: new THREE.Color('brown'),
  nature: new THREE.Color('green'),
};

/**
 * Update every block in the given data texture.
 * @param {*} textRef 
 * @param {*} size 
 * @param {*} worldState a width x height x 3 array for the RGB color for each x,y position
 */
function updateDataTexture(textRef, size, worldState) {
  if (!worldState) return;
  for ( var i = 0; i < size; i ++ ) {
    const obj = worldState[i];
    delete obj.x;
    delete obj.y;
    const bestType = Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
    const color = COLORS[bestType];
    var stride = i * 3;
    var r = Math.floor( color.r * 255 );
    var g = Math.floor( color.g * 255 );
    var b = Math.floor( color.b * 255 );

    textRef.current.map.image.data.set([r,g,b], stride);
  }
  textRef.current.map.needsUpdate = true;
}

const IMG_LOC = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/';
const MAP_IMG_LOC = IMG_LOC + 'mars-map.jpg';
const BUMP_IMG_LOC = IMG_LOC + 'mars-bump.jpg';

function getRasterData() {
  const color = new THREE.Color();
  const data = [];
  for (let i = 0; i < 10000; i++) {
    data[i] = Math.floor(Math.random() * 4);
  }
  return data;
}

function Mars({ showRegions }) {
  // Create RASTER texture
  const width = 100;
  const height = 100;
  const size = width * height;
  const data = new Uint8Array(3 * size);
  // used the buffer to create a DataTexture
  // createData(data, size);
  var rasterTexture = new THREE.DataTexture(data, width, height, THREE.RGBFormat);
  rasterTexture.needsUpdate = true;

  let group = useRef();
  let raster = useRef();
  let theta = 0;

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const data = getRasterData();
  //     // for each block in the texture, we check if the color has changed
  //     for (let i = 0; i < 4000; i++) {
  //       const currentRGB = raster.current.map.image.data.slice(i, i+3);
  //       console.log(currentRGB);
  //       const newColorIdx = data[i];
  //       const newRGB = COLORS[newColorIdx];
        
  //       var r = Math.floor( Math.random() * 255 );
  //       var g = Math.floor( Math.random() * 255 );
  //       var b = Math.floor( Math.random() * 255 );
    
  //       raster.current.map.image.data.set([r,g,b], i*3);
  //     }
  //     raster.current.map.needsUpdate = true;
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [0]);

  let prevSeconds = 0;

  const { gl, scene, camera } = useThree();
  const controls = new OrbitControls(camera, gl.domElement);
  controls.enableZoom = true;
  controls.addEventListener('change', () => gl.render(scene, camera));

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    gl.setSize(window.innerWidth - 40, window.innerHeight - 40);
  }

  useEffect(() => {
    window.addEventListener('resize', onWindowResize, false);
    return () => {
      window.removeEventListener('resize', onWindowResize, false);
    };
  }, [0]);

  // Continuously update the GL render
  useRender(() => {
    // const y = Math.sin(THREE.Math.degToRad((theta += 0.08)));
    theta += 0.0015;
    const y = theta;
    group.current.rotation.set(0, y, 0);
    controls.update();
    // Continuously update the RASTER texture
    const date = new Date();
    if (date.getSeconds() !== prevSeconds) {
      fetchWorldState().then(data => updateDataTexture(raster, size, data));
      prevSeconds = date.getSeconds();
    }
  });

  // Load the MARS texture images
  const loader = new THREE.TextureLoader();
  const [mapTexture, bumpTexture] = useMemo(() => {
    return [loader.load(MAP_IMG_LOC), loader.load(BUMP_IMG_LOC)]
  }, [MAP_IMG_LOC, BUMP_IMG_LOC]);

  return (
    <group ref={group}>
      <animated.mesh position={[0,0,0]}>
        <sphereGeometry attach="geometry" args={[2, 32, 32]} />
        <meshPhongMaterial attach="material" map={mapTexture} bumpMap={bumpTexture} bumpScale={8} specular={new THREE.Color('#000000')} />
      </animated.mesh>
      <animated.mesh visible={showRegions} position={[0,0,0]}>
        <sphereGeometry attach="geometry" args={[2, 32, 32]} />
        <animated.meshPhongMaterial attach="material" ref={raster} map={rasterTexture} opacity={0.2} transparent />
      </animated.mesh>
    </group>
  );
}

function Stars() {
  let group = useRef()
  let theta = 0
  useRender(() => {
    // Some things maybe shouldn't be declarative, we're in the render-loop here with full access to the instance
    const z = 5 * Math.sin(THREE.Math.degToRad((theta += 0.005)))
    // const s = Math.cos(THREE.Math.degToRad(theta * 2))
    group.current.rotation.set(0, z, 0)
    // group.current.scale.set(s, s, s)
  })
  const [geo, mat, vertices, coords] = useMemo(() => {
    const geo = new THREE.SphereBufferGeometry(0.4, 10, 10)
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color('lightblue') })
    const coords = new Array(2000).fill().map(i => [Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 800 - 400])
    return [geo, mat, vertices, coords]
  }, [])
  return (
    <group ref={group}>
      {coords.map(([p1, p2, p3], i) => (
        <mesh key={i} geometry={geo} material={mat} position={[p1, p2, p3]} />
      ))}
    </group>
  )
}

function Universe({ showRegions }) {
  return (
    <Canvas
      className="Universe"
      // orthographic={true}
      onMouseDown={() => document.body.style.cursor = "grabbing"}
      onMouseUp={() => document.body.style.cursor = "grab"}
    >
      <ambientLight color="white" />
      <pointLight color="white" intensity={0.06} position={[10, 10, 10]} />
      <Mars showRegions={showRegions} />
      <Stars />
    </Canvas>
  );
}

export default Universe;

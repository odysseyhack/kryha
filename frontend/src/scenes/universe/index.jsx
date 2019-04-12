import * as THREE from 'three/src/Three';
import React, { useState, useRef, useMemo } from 'react';
// A THREE.js React renderer, see: https://github.com/drcmda/react-three-fiber
import { Canvas, useRender } from 'react-three-fiber';
// A React animation lib, see: https://github.com/react-spring/react-spring
import { useSpring, animated } from 'react-spring/three';
import './index.css';

function Octahedron() {
  const [active, setActive] = useState(false)
  const [hovered, setHover] = useState(false)
  const vertices = [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
  const { color, pos, ...props } = useSpring({
    color: active ? 'hotpink' : 'white',
    pos: active ? [0, 0, 2] : [0, 0, 0],
    'material-opacity': hovered ? 0.6 : 0.25,
    scale: active ? [1.5, 1.5, 1.5] : [1, 1, 1],
    rotation: active ? [THREE.Math.degToRad(180), 0, THREE.Math.degToRad(45)] : [0, 0, 0],
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 }
  })
  return (
    <group>
      <animated.line position={pos}>
        <geometry attach="geometry" vertices={vertices.map(v => new THREE.Vector3(...v))} />
        <animated.lineBasicMaterial attach="material" color={color} />
      </animated.line>
      <animated.mesh onClick={e => setActive(!active)} onPointerOver={e => setHover(true)} onPointerOut={e => setHover(false)} {...props}>
        <octahedronGeometry attach="geometry" />
        <meshStandardMaterial attach="material" color="grey" transparent />
      </animated.mesh>
    </group>
  )
}

function Mars() {
  let group = useRef();
  let theta = 0;
  useRender(() => {
    const y = 5 * Math.sin(THREE.Math.degToRad((theta += 0.05)));
    group.current.rotation.set(0, y, 0);
  });

  const IMG_LOC = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/';
  const MAP_IMG_LOC = IMG_LOC + 'mars-map.jpg';
  const BUMP_IMG_LOC = IMG_LOC + 'mars-bump.jpg';

  let loader = new THREE.TextureLoader();
  const [mapTexture, bumpTexture] = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return [loader.load(MAP_IMG_LOC), loader.load(BUMP_IMG_LOC)]
  }, [MAP_IMG_LOC, BUMP_IMG_LOC]);

  return (
    <group ref={group}>
      <animated.mesh position={[0,0,0]}>
        <sphereGeometry attach="geometry" args={[2, 32, 32]} />
        <meshPhongMaterial attach="material" map={mapTexture} bumpMap={bumpTexture} bumpScale={8} />
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

function Universe() {
  return (
    <Canvas className="Universe">
      <ambientLight color="white" />
      <pointLight color="white" intensity={0.05} position={[10, 10, 10]} />
      {/* <Octahedron /> */}
      <Mars />
      <Stars />
    </Canvas>
  );
}

export default Universe;

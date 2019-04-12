import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSpring, animated } from 'react-spring/three'

const IMG_LOC = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/';
const MAP_IMG_LOC = IMG_LOC + 'mars-map.jpg';
const BUMP_IMG_LOC = IMG_LOC + 'mars-bump.jpg';

function Mars() {
  // const [mapTexture, bumpTexture] = useMemo(() => {
  //   const loader = new THREE.TextureLoader();
  //   return [loader.load(MAP_IMG_LOC), loader.load(BUMP_IMG_LOC)]
  // }, [MAP_IMG_LOC, BUMP_IMG_LOC]);
  // // const props = useSpring({opacity: 0.9});

  return (
    <mesh
      visible
      rotation={new THREE.Euler(0, 0, 0)}
      geometry={new THREE.SphereGeometry(1, 16, 16)}
      material={new THREE.MeshBasicMaterial({ color: new THREE.Color('indianred'), transparent: true })}
    />
  );
}

export default Mars;

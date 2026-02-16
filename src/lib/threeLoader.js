import * as THREE from 'three';

let isThreeLoaded = false;
let threeLoadPromise = null;

export const loadThree = () => {
  if (isThreeLoaded && window.THREE) {
    return Promise.resolve(window.THREE);
  }

  if (threeLoadPromise) {
    return threeLoadPromise;
  }

  threeLoadPromise = new Promise((resolve) => {
    window.THREE = THREE;
    isThreeLoaded = true;
    console.log('[ThreeLoader] Three.js loaded from npm package.');
    resolve(THREE);
  });

  return threeLoadPromise;
};

// Reset function for development/testing
export const resetThreeLoader = () => {
  threeLoadPromise = null;
  isThreeLoaded = false;
};

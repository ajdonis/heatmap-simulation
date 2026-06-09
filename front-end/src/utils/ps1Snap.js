import { Vector2 } from 'three'
import { useCallback } from 'react'

// Patches a material's vertex shader to snap clip-space xy to a coarse pixel
// grid — the signature PS1 vertex-jitter "wobble". As an object moves, its
// vertices snap between grid positions instead of moving smoothly.
//
// width × height defines the effective resolution of the snap grid. Lower
// values = chunkier, more chaotic jitter. Higher = subtler. PS1-native was
// roughly 320×240; 160×120 gives a satisfying retro wobble.
export function applyPS1Snap(material, width = 320, height = 260) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPS1Grid = { value: new Vector2(width, height) }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform vec2 uPS1Grid;`
      )
      // After three.js's standard projection, snap gl_Position to the grid.
      // Divide by w → NDC, scale to grid, floor, then un-project.
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
         gl_Position.xy = floor(gl_Position.xy / gl_Position.w * uPS1Grid * 0.5) / (uPS1Grid * 0.5) * gl_Position.w;`
      )
  }
  // Prevents three.js from confusing this patched material with un-patched ones
  // in its internal shader cache.
  material.customProgramCacheKey = () => `ps1-snap-${width}-${height}`
}


export function applyBayerDither(material) {
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `
      // Hard cutoff — discard near-zero alpha before dithering
      if (diffuseColor.a < 0.05) discard;

      // Bayer 4x4 dither — column-major mat4 layout
      const mat4 bayerMatrix = mat4(
         0.0, 12.0,  3.0, 15.0,
         8.0,  4.0, 11.0,  7.0,
         2.0, 14.0,  1.0, 13.0,
        10.0,  6.0,  9.0,  5.0
      ) * (1.0 / 16.0);
      int bx = int(mod(gl_FragCoord.x, 4.0));
      int by = int(mod(gl_FragCoord.y, 4.0));
      float threshold = bayerMatrix[bx][by];
      if (diffuseColor.a < threshold) discard;
      diffuseColor.a = 1.0;
      #include <opaque_fragment>
      `
    );
  };
  material.customProgramCacheKey = () => 'bayer-dither';
}

export function usePS1Snap(width = 320, height = 240) {
  return useCallback((material) => {
    if (material) applyPS1Snap(material, width, height)
  }, [width, height])
}


export function useBayerDither() {
  return useCallback((material) => {
    if (material) applyBayerDither(material)
  }, [])
}
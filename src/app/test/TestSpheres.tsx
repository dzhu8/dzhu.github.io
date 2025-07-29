"use client";

import React from 'react';
import ThreeDContainer from './ThreeDContainer';

export default function TestSpheres() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <h1 style={{ 
        position: 'relative', 
        zIndex: 10, 
        textAlign: 'center', 
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        margin: '20px'
      }}>
        Test Spheres - Z-Axis Visualization
      </h1>
      
      <ThreeDContainer 
        showTestSpheres={true}
        showAxes={false}
        isHeroSection={false}
      />
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 10
      }}>
        <h3>Sphere Positions:</h3>
        <ul>
          <li>Red: (-4, 0, -4)</li>
          <li>Green: (-2, 0, -2)</li>
          <li>Blue: (0, 0, 0)</li>
          <li>Yellow: (2, 0, 2)</li>
          <li>Magenta: (4, 0, 4)</li>
        </ul>
      </div>
    </div>
  );
}

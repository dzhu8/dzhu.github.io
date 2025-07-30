"use client";

import React from 'react';
import ThreeDContainer from './ThreeDContainer';

export default function TestAxes() {
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
        Test Axes - Y-Axis Visualization
      </h1>
      
      <ThreeDContainer 
        showAxes={true}
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
        <h3>Axis Legend:</h3>
        <ul>
          <li style={{ color: 'red' }}>Red: X-Axis</li>
          <li style={{ color: 'green' }}>Green: Y-Axis</li>
          <li style={{ color: 'blue' }}>Blue: Z-Axis</li>
        </ul>
        <p>Grid shows XZ plane at Y=0</p>
      </div>
    </div>
  );
}

"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ThreeDContainerProps {
  showTestSpheres?: boolean;
  showAxes?: boolean;
  isHeroSection?: boolean;
  cameraDistance?: number;
}

export default function ThreeDContainer({ 
  showTestSpheres = false, 
  showAxes = false,
  isHeroSection = false,
  cameraDistance = 10
}: ThreeDContainerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Capture the current mount reference for cleanup
    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, cameraDistance);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    
    // Ensure renderer fills its parent container
    const updateRendererSize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    
    updateRendererSize();
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Style the canvas to ensure it covers its parent section
    renderer.domElement.style.position = 'absolute'; // Relative to parent section
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none'; // Allow clicks to pass through
    renderer.domElement.style.zIndex = isHeroSection ? '1' : '0'; // Hero behind content, sections behind content

    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add test spheres if enabled
    let animatedSphere: THREE.Mesh | null = null;
    if (showTestSpheres) {
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
      const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);

      colors.forEach((color, index) => {
        const material = new THREE.MeshBasicMaterial({ color });
        const sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.position.set(
          (index - 2) * 2, // Spread along x-axis
          0,
          (index - 2) * 2  // Spread along z-axis
        );
        scene.add(sphere);
        
        // Mark the first sphere for animation
        if (index === 0) {
          animatedSphere = sphere;
        }
      });
    }

    // Add axes helper if enabled
    let xLabels: HTMLDivElement[] = [];
    if (showAxes) {
      // Scale axes and grid based on camera distance
      const scaleFactorForCamera = cameraDistance / 5; // Scale relative to half the default distance of 10
      const axesHelper = new THREE.AxesHelper(5 * scaleFactorForCamera);
      scene.add(axesHelper);

      // Add grid to show the XZ plane
      const gridHelper = new THREE.GridHelper(10 * scaleFactorForCamera, 10);
      scene.add(gridHelper);

      // Add x-axis labels as HTML elements
      const xPositions = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(x => x * scaleFactorForCamera);
      xLabels = xPositions.map((x, index) => {
        const label = document.createElement('div');
        label.textContent = ([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5][index]).toString();
        label.style.position = 'absolute';
        label.style.color = '#ff0000';
        label.style.fontSize = '14px';
        label.style.pointerEvents = 'none';
        label.style.zIndex = '2';
        label.style.transform = 'translate(-50%, -50%)';
        label.style.fontWeight = 'bold';
        currentMount.appendChild(label);
        return label;
      });
    }

    // Animation loop
    let animationTime = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      animationTime += 0.016; // Approximate delta time

      // Animate the first sphere along x-axis and rotate others
      if (showTestSpheres) {
        scene.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
            if (child === animatedSphere) {
              // Animate along x-axis from -8 to +8 in a looping pattern
              child.position.x = Math.sin(animationTime * 0.5) * 8;
              child.position.y = Math.sin(animationTime * 0.7) * 2; // Add some vertical movement
            } else {
              child.rotation.y += 0.01;
            }
          }
        });
      }

      // Update x-axis label positions
      if (showAxes && xLabels.length > 0 && camera) {
        const scaleFactorForCamera = cameraDistance / 10;
        const xPositions = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(x => x * scaleFactorForCamera);
        xLabels.forEach((label, i) => {
          // Project 3D position to 2D screen
          const pos = new THREE.Vector3(xPositions[i], 0, 0);
          pos.project(camera);
          const x = (pos.x * 0.5 + 0.5) * currentMount.clientWidth;
          const y = (-pos.y * 0.5 + 0.5) * currentMount.clientHeight;
          label.style.left = `${x}px`;
          label.style.top = `${y}px`;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && currentMount) {
        cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        updateRendererSize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // Remove x-axis labels
      if (xLabels && currentMount) {
        xLabels.forEach(label => {
          currentMount.removeChild(label);
        });
      }
    };
  }, [showTestSpheres, showAxes, isHeroSection, cameraDistance]);

  return (
    <div 
      ref={mountRef} 
      className={`three-d-container ${isHeroSection ? 'hero-3d' : 'section-3d'}`}
      style={{
        position: 'absolute', // Relative to parent section
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: isHeroSection ? 1 : 0,
        margin: 0,
        padding: 0
      }}
    />
  );
}

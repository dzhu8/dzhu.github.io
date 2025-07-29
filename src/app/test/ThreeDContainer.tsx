"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from '../utils/three/OBJLoader.js';
import { CraneGroup, CraneInstance, CraneUtilities } from '../components/animations/origami-crane.js';

interface ThreeDContainerProps {
  showAxes?: boolean;
  isHeroSection?: boolean;
  cameraDistance?: number;
  craneScale?: number;
  wingFlapSpeed?: number;
}

export default function ThreeDContainer({ 
  showAxes = false,
  isHeroSection = false,
  cameraDistance = 10,
  craneScale = 1.0,
  wingFlapSpeed = 7.5
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

    // Add crane instances
    let craneGroup: CraneGroup | null = null;
    let cranesLoaded = false;
    
    // Create a crane group
    craneGroup = new CraneGroup('test-cranes');
    
    // Load the crane OBJ file and create instances
    const objLoader = new OBJLoader();
    objLoader.load('/crane-3D.obj', (objObject) => {
      if (!craneGroup) return;
      
      // Create 10 crane instances
      for (let i = 0; i < 10; i++) {
        const crane = new CraneInstance(`crane-${i}`);
        
        // Load the crane from OBJ object
        crane.loadFromOBJObject(objObject.clone());
        
        // Set random y and z positions at x = -15
        const randomY = (Math.random() - 0.5) * 20; // Random Y between -10 and 10
        const randomZ = (Math.random() - 0.5) * 20; // Random Z between -10 and 10
        crane.setPosition(-15, randomY, randomZ);
        
        // Process the crane instance
        CraneUtilities.processCraneInstance(crane, craneScale); // Use dynamic scale
        
        // Add crane to the group
        craneGroup.addCrane(crane);
        
        // Add crane object to scene
        if (crane.craneObject) {
          scene.add(crane.craneObject);
        }
      }
      
      // Apply materials to all cranes
      craneGroup.applyMaterialsToAllCranes(true);
      
      // Start wing flapping animation
      craneGroup.startAllWingFlapping();
      
      cranesLoaded = true;
    }, undefined, (error: unknown) => {
      console.error('Error loading crane OBJ file:', error);
    });

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
    const animate = () => {
      requestAnimationFrame(animate);

      // Update crane animations
      if (craneGroup && cranesLoaded) {
        craneGroup.updateAllAnimations(wingFlapSpeed);
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
  }, [showAxes, isHeroSection, cameraDistance, craneScale, wingFlapSpeed]);

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

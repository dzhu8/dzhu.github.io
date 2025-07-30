"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from '../utils/three/OBJLoader.js';
import { CraneGroup, CraneInstance, CraneUtilities } from '../components/animations/origami-crane.js';
import { QuaternionTransforms } from '../utils/quaternion-transforms.js';

interface ThreeDContainerProps {
  showAxes?: boolean;
  isHeroSection?: boolean;
  cameraDistance?: number;
  craneScale?: number;
  wingFlapSpeed?: number;
  pathSpeed?: number;
}

export default function ThreeDContainer({ 
  showAxes = false,
  isHeroSection = false,
  cameraDistance = 10,
  craneScale = 1.0,
  wingFlapSpeed = 7.5,
  pathSpeed = 2.0
}: ThreeDContainerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Path and animation state
  const pathsRef = useRef<THREE.Vector3[][]>([]);
  const pathLinesRef = useRef<THREE.Line[]>([]);
  const pathZCoordinatesRef = useRef<{startZ: number[], endZ: number[]}>({startZ: [], endZ: []});
  const cranePathDataRef = useRef<Array<{
    pathPoints: THREE.Vector3[];
    currentPathIndex: number;
    pathProgress: number;
    currentPosition: THREE.Vector3;
    referenceVector: THREE.Vector3;
    derivativeHistory: THREE.Vector3[];
    isInitialAlignment: boolean;
  }>>([]);
  const animationTimeRef = useRef<number>(0);

  // Alignment constants (similar to origami-flock)
  const REALIGNMENT_INTERVAL = 0.1; // Seconds between re-alignments
  const DERIVATIVE_SMOOTHING_FRAMES = 5; // Number of frames to smooth derivative
  const MAX_ANGLE_CHANGE = 90; // Maximum angle change per update for smooth transitions (degrees)
  const lastRealignmentTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Capture the current mount reference for cleanup
    const currentMount = mountRef.current;

    // Define trapezoidal viewing dimensions to combat perspective distortion
    const viewDepth = cameraDistance * 0.4; // Depth of the viewing volume
    const viewHeight = cameraDistance * 1.2;
    
    // Create trapezoidal container: front face narrower, back face wider
    // This compensates for perspective projection making distant objects appear smaller
    const frontZ = 2.5 - viewDepth * 0.5; // Front of the viewing volume
    const backZ = 2.5 + viewDepth * 0.5;  // Back of the viewing volume
    
    // Calculate perspective compensation factor
    // Objects at backZ appear smaller by factor of frontZ/backZ, so we scale them up
    const perspectiveCompensation = (cameraDistance - frontZ) / (cameraDistance - backZ);
    
    // Front and back face widths
    const frontWidth = cameraDistance * 2;
    const backWidth = frontWidth * perspectiveCompensation; // Wider back face
    
    // Y-axis limits as a fraction of the view area (same for front and back)
    const Y_LIMIT_FACTOR = 0.9; // Use 90% of the available height
    const frontYLimit = viewHeight * Y_LIMIT_FACTOR * 0.5;
    const backYLimit = frontYLimit * perspectiveCompensation; // Taller back face

    // Path generation functions for trapezoidal container
    const generateRandomPoint = (isStart: boolean) => {
      if (isStart) {
        // Start points on the left side (front face)
        const yRange = frontYLimit * 2;
        const yOffset = -frontYLimit + Math.random() * yRange;
        const zOffset = frontZ + Math.random() * viewDepth;
        
        // Interpolate width based on z-position within the viewing volume
        const zProgress = (zOffset - frontZ) / viewDepth;
        const currentWidth = frontWidth + (backWidth - frontWidth) * zProgress;
        const currentYLimit = frontYLimit + (backYLimit - frontYLimit) * zProgress;
        
        return new THREE.Vector3(
          -currentWidth * 0.8,
          Math.max(-currentYLimit, Math.min(currentYLimit, yOffset)),
          zOffset
        );
      } else {
        // End points on the right side (back face)
        const yRange = backYLimit * 2;
        const yOffset = -backYLimit + Math.random() * yRange;
        const zOffset = frontZ + Math.random() * viewDepth;
        
        // Interpolate width based on z-position within the viewing volume
        const zProgress = (zOffset - frontZ) / viewDepth;
        const currentWidth = frontWidth + (backWidth - frontWidth) * zProgress;
        const currentYLimit = frontYLimit + (backYLimit - frontYLimit) * zProgress;
        
        return new THREE.Vector3(
          currentWidth * 0.8,
          Math.max(-currentYLimit, Math.min(currentYLimit, yOffset)),
          zOffset
        );
      }
    };

    const createSmoothCurvedPath = (startPoint: THREE.Vector3, endPoint: THREE.Vector3, pathIndex: number) => {
      const points: THREE.Vector3[] = [];
      
      // Create control points for smooth Bézier-like curve
      const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
      const distance = direction.length();
      direction.normalize();

      // Generate perpendicular vectors for curve variation
      const perpendicular1 = new THREE.Vector3();
      const perpendicular2 = new THREE.Vector3();

      if (Math.abs(direction.x) < 0.9) {
        perpendicular1.set(1, 0, 0);
      } else {
        perpendicular1.set(0, 1, 0);
      }
      perpendicular1.cross(direction).normalize();
      perpendicular2.crossVectors(direction, perpendicular1).normalize();

      // Curve parameters with varied concavity
      const maxCurveOffset = distance * 0.12; // Slightly smaller overall curve
      const maxZOffset = viewDepth * 0.15; // Much smaller z-axis variation
      const numControlPoints = 3;

      // Determine curve direction: even indices go up, odd indices go down
      const curveDirection = (pathIndex % 2 === 0) ? 1 : -1; // +1 for concave up, -1 for concave down

      // Start point
      points.push(startPoint.clone());

      // Generate intermediate control points with varied concavity
      for (let i = 1; i <= numControlPoints; i++) {
        const t = i / (numControlPoints + 1);
        
        // Linear interpolation along main direction
        const basePoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, t);
        
        // Add smooth offset with alternating concavity
        const offsetScale = Math.sin(t * Math.PI) * maxCurveOffset;
        const zOffsetScale = Math.sin(t * Math.PI) * maxZOffset * 0.3; // Much smaller z variation
        
        // Apply curve direction to Y offset for concave up/down behavior
        const randomOffsetY = (Math.sin(t * Math.PI * 2 + Math.random() * Math.PI) - 0.5) * offsetScale * curveDirection;
        const randomOffsetZ = (Math.cos(t * Math.PI * 2 + Math.random() * Math.PI) - 0.5) * zOffsetScale;
        
        basePoint.add(new THREE.Vector3(0, randomOffsetY, randomOffsetZ));
        
        // Calculate y-limit for this z-position in the trapezoidal volume
        const zProgress = (basePoint.z - frontZ) / viewDepth;
        const currentYLimit = frontYLimit + (backYLimit - frontYLimit) * zProgress;
        
        // Clamp the y-coordinate to stay within limits
        basePoint.y = Math.max(-currentYLimit, Math.min(currentYLimit, basePoint.y));
        
        points.push(basePoint);
      }

      // End point
      points.push(endPoint.clone());

      // Create smooth curve using Catmull-Rom spline
      const curve = new THREE.CatmullRomCurve3(points);
      curve.tension = 0.3; // Slightly higher tension for smoother, more gradual curves

      // Sample points along the curve
      const pathResolution = 150; // Fewer points for smoother but efficient animation
      const curvePoints = curve.getPoints(pathResolution);

      // Post-process: Clamp all y-values to ensure they stay within limits
      curvePoints.forEach(point => {
        const zProgress = (point.z - frontZ) / viewDepth;
        const currentYLimit = frontYLimit + (backYLimit - frontYLimit) * zProgress;
        point.y = Math.max(-currentYLimit, Math.min(currentYLimit, point.y));
      });

      // Final smoothing pass
      const smoothedPoints = [...curvePoints];
      const smoothingPasses = 2; // Number of smoothing iterations
      const smoothingWeight = 0.3; // How much to blend with neighbors (0-1)

      for (let pass = 0; pass < smoothingPasses; pass++) {
        for (let i = 1; i < smoothedPoints.length - 1; i++) {
          const prev = smoothedPoints[i - 1];
          const current = smoothedPoints[i];
          const next = smoothedPoints[i + 1];
          
          // Average with neighbors, but only smooth Y to preserve path direction
          const smoothedY = current.y * (1 - smoothingWeight) + 
                           (prev.y + next.y) * 0.5 * smoothingWeight;
          
          // Calculate y-limit for this z-position and apply smoothed Y but keep it within limits
          const zProgress = (current.z - frontZ) / viewDepth;
          const currentYLimit = frontYLimit + (backYLimit - frontYLimit) * zProgress;
          smoothedPoints[i].y = Math.max(-currentYLimit, Math.min(currentYLimit, smoothedY));
        }
      }

      return smoothedPoints;
    };

    const generateCranePaths = (craneCount: number) => {
      const paths: THREE.Vector3[][] = [];
      const cranePathData: Array<{
        pathPoints: THREE.Vector3[];
        currentPathIndex: number;
        pathProgress: number;
        currentPosition: THREE.Vector3;
        referenceVector: THREE.Vector3;
        derivativeHistory: THREE.Vector3[];
        isInitialAlignment: boolean;
      }> = [];

      // Initialize z-coordinate storage
      const startZCoords: number[] = [];
      const endZCoords: number[] = [];

      for (let i = 0; i < craneCount; i++) {
        const startPoint = generateRandomPoint(true);
        const endPoint = generateRandomPoint(false);
        const pathPoints = createSmoothCurvedPath(startPoint, endPoint, i);
        
        // Store z-coordinates
        startZCoords.push(Number(startPoint.z.toFixed(2)));
        endZCoords.push(Number(endPoint.z.toFixed(2)));
        
        // Calculate initial direction vector for alignment
        const initialDirection = new THREE.Vector3().subVectors(pathPoints[1], pathPoints[0]).normalize();
        
        paths.push(pathPoints);
        cranePathData.push({
          pathPoints,
          currentPathIndex: 0,
          pathProgress: Math.random(), // Random starting progress for variety
          currentPosition: pathPoints[0].clone(),
          referenceVector: initialDirection.clone(),
          derivativeHistory: [],
          isInitialAlignment: true
        });
      }

      pathsRef.current = paths;
      cranePathDataRef.current = cranePathData;
      pathZCoordinatesRef.current = {startZ: startZCoords, endZ: endZCoords};
      
      return paths;
    };

    const visualizePaths = (scene: THREE.Scene, paths: THREE.Vector3[][]) => {
      // Clear existing path lines
      pathLinesRef.current.forEach(line => {
        scene.remove(line);
      });
      pathLinesRef.current = [];

      // Create new path lines
      paths.forEach(path => {
        const geometry = new THREE.BufferGeometry().setFromPoints(path);
        const material = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const line = new THREE.Line(geometry, material);
        
        scene.add(line);
        pathLinesRef.current.push(line);
      });
    };

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

    // Add crane instances with path animation
    let craneGroup: CraneGroup | null = null;
    let cranesLoaded = false;
    const craneCount = 10;
    
    // Generate paths for cranes
    const paths = generateCranePaths(craneCount);
    
    // Visualize the paths in black
    visualizePaths(scene, paths);
    
    // Create a crane group
    craneGroup = new CraneGroup('test-cranes');
    
    // Load the crane OBJ file and create instances
    const objLoader = new OBJLoader();
    objLoader.load('/crane-3D.obj', (objObject) => {
      if (!craneGroup) return;
      
      // Create crane instances along paths
      for (let i = 0; i < craneCount; i++) {
        const crane = new CraneInstance(`crane-${i}`);
        
        // Load the crane from OBJ object
        crane.loadFromOBJObject(objObject.clone());
        
        // Set initial position to start of path
        const pathData = cranePathDataRef.current[i];
        if (pathData && pathData.pathPoints.length > 0) {
          const startPos = pathData.pathPoints[0];
          crane.setPosition(startPos.x, startPos.y, startPos.z);
          pathData.currentPosition.copy(startPos);
        }
        
        // Process the crane instance
        CraneUtilities.processCraneInstance(crane, craneScale);
        
        // Perform initial crane analysis for alignment system
        crane.performCraneAnalysis();
        
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

    // Path animation function with alignment
    const updateCranePositions = (deltaTime: number) => {
      if (!craneGroup || !cranesLoaded) return;
      
      const travelSpeed = pathSpeed; // Use the pathSpeed prop instead of hardcoded value
      const cranes = craneGroup.getCranes(); // Get all cranes
      
      // Update animation time
      animationTimeRef.current += deltaTime;
      
      cranePathDataRef.current.forEach((pathData, index) => {
        const crane = cranes[index];
        if (!crane || !crane.craneObject || !pathData.pathPoints.length) return;
        
        // Update progress along current path segment
        pathData.pathProgress += travelSpeed * deltaTime;
        
        // Check if we need to move to next segment or restart
        if (pathData.pathProgress >= 1.0) {
          pathData.currentPathIndex++;
          pathData.pathProgress = 0.0;
          
          // If we've reached the end, restart from beginning
          if (pathData.currentPathIndex >= pathData.pathPoints.length - 1) {
            pathData.currentPathIndex = 0;
            pathData.pathProgress = Math.random() * 0.5; // Add some variety to restart timing
          }
        }
        
        // Interpolate position along current path segment
        if (pathData.currentPathIndex < pathData.pathPoints.length - 1) {
          const currentPoint = pathData.pathPoints[pathData.currentPathIndex];
          const nextPoint = pathData.pathPoints[pathData.currentPathIndex + 1];
          
          pathData.currentPosition.lerpVectors(currentPoint, nextPoint, pathData.pathProgress);
          
          // Update crane position
          crane.craneObject.position.copy(pathData.currentPosition);
          crane.updateObjectCenter();
          
          // Calculate current derivative (direction to next point)
          const currentDerivative = new THREE.Vector3(1, 0, 0); // Default forward
          
          if (pathData.currentPathIndex < pathData.pathPoints.length - 2) {
            const futurePoint = pathData.pathPoints[pathData.currentPathIndex + 2];
            currentDerivative.subVectors(futurePoint, currentPoint).normalize();
          } else if (pathData.currentPathIndex < pathData.pathPoints.length - 1) {
            currentDerivative.subVectors(nextPoint, currentPoint).normalize();
          }
          
          // Add to derivative history for smoothing
          pathData.derivativeHistory.push(currentDerivative.clone());
          if (pathData.derivativeHistory.length > DERIVATIVE_SMOOTHING_FRAMES) {
            pathData.derivativeHistory.shift();
          }
          
          // Calculate smoothed reference vector
          if (pathData.derivativeHistory.length > 0) {
            const smoothedVector = new THREE.Vector3();
            pathData.derivativeHistory.forEach(vec => smoothedVector.add(vec));
            smoothedVector.divideScalar(pathData.derivativeHistory.length);
            
            if (smoothedVector.length() > 0.1) {
              pathData.referenceVector.copy(smoothedVector.normalize());
            }
          }
          
          // Perform alignment every REALIGNMENT_INTERVAL seconds
          if (
            animationTimeRef.current - lastRealignmentTimeRef.current >= REALIGNMENT_INTERVAL &&
            !pathData.isInitialAlignment &&
            !crane.isAnimating
          ) {
            performAlignment(crane, pathData);
          }
          
          // Handle initial alignment
          if (pathData.isInitialAlignment) {
            performInitialAlignment(crane, pathData);
            pathData.isInitialAlignment = false;
          }
        }
      });
      
      // Update last realignment time for all cranes
      if (animationTimeRef.current - lastRealignmentTimeRef.current >= REALIGNMENT_INTERVAL) {
        lastRealignmentTimeRef.current = animationTimeRef.current;
      }
    };

    // Define path data type for alignment functions
    type PathDataType = {
      pathPoints: THREE.Vector3[];
      currentPathIndex: number;
      pathProgress: number;
      currentPosition: THREE.Vector3;
      referenceVector: THREE.Vector3;
      derivativeHistory: THREE.Vector3[];
      isInitialAlignment: boolean;
    };

    // Perform initial alignment for crane
    const performInitialAlignment = (crane: CraneInstance, pathData: PathDataType) => {
      if (!crane || !pathData) return;

      // Step 1: Align to positive X-axis first
      const positiveXVector = new THREE.Vector3(1, 0, 0);
      crane.updateReferenceVectorWithUpRotation(positiveXVector, QuaternionTransforms);

      // Step 2: Align to initial reference vector using smooth update
      crane.updateReferenceVectorSmooth(pathData.referenceVector, MAX_ANGLE_CHANGE, QuaternionTransforms);

      // Perform initial crane analysis and alignment
      crane.performCraneAnalysis();
      crane.performAlignmentTestFlight(QuaternionTransforms, pathData.referenceVector);
    };

    // Perform periodic alignment for crane
    const performAlignment = (crane: CraneInstance, pathData: PathDataType) => {
      if (!crane || !pathData || crane.isAnimating) return;

      // Update the crane's reference vector using smooth transitions
      crane.updateReferenceVectorSmooth(pathData.referenceVector, MAX_ANGLE_CHANGE, QuaternionTransforms);

      // Perform crane analysis and alignment
      crane.performCraneAnalysis();
      crane.performAlignmentTestFlight(QuaternionTransforms, pathData.referenceVector);
    };

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
    let lastFrameTime = 0;
    const animate = (currentTime: number = 0) => {
      requestAnimationFrame(animate);

      // Calculate delta time in seconds
      const deltaTime = lastFrameTime ? (currentTime - lastFrameTime) / 1000 : 0;
      lastFrameTime = currentTime;

      // Update crane path positions (includes animation time update)
      if (deltaTime > 0) {
        updateCranePositions(deltaTime);
      }

      // Update crane wing flapping animations
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
      
      // Clean up path lines
      pathLinesRef.current.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) {
          if (Array.isArray(line.material)) {
            line.material.forEach(mat => mat.dispose());
          } else {
            line.material.dispose();
          }
        }
        scene.remove(line);
      });
      pathLinesRef.current = [];
      
      renderer.dispose();
      
      // Remove x-axis labels
      if (xLabels && currentMount) {
        xLabels.forEach(label => {
          currentMount.removeChild(label);
        });
      }
    };
  }, [showAxes, isHeroSection, cameraDistance, craneScale, wingFlapSpeed, pathSpeed]);

  return (
    <>
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
      
      {/* Z-axis coordinates display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '12px',
        fontFamily: 'monospace',
        maxHeight: '300px',
        overflowY: 'auto',
        minWidth: '200px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Path Z-Coordinates</div>
        <div style={{ marginBottom: '6px' }}>
          <strong>Start Z:</strong> [{pathZCoordinatesRef.current.startZ.join(', ')}]
        </div>
        <div>
          <strong>End Z:</strong> [{pathZCoordinatesRef.current.endZ.join(', ')}]
        </div>
      </div>
    </>
  );
}

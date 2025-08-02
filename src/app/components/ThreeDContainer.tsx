"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OBJLoader } from "../utils/three/OBJLoader.js";
import { CraneGroup, CraneInstance, CraneUtilities } from "../components/animations/origami-crane.js";
import { QuaternionTransforms } from "../utils/quaternion-transforms.js";
import { PathGenerator, PathData } from "./animations/pathGeneration";

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
     pathSpeed = 2.0,
}: ThreeDContainerProps) {
     const mountRef = useRef<HTMLDivElement>(null);
     const sceneRef = useRef<THREE.Scene | null>(null);
     const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
     const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

     // Path and animation state
     const pathsRef = useRef<THREE.Vector3[][]>([]);
     const pathLinesRef = useRef<THREE.Line[]>([]);
     const pathZCoordinatesRef = useRef<{ startZ: number[]; endZ: number[] }>({ startZ: [], endZ: [] });
     const cranePathDataRef = useRef<PathData[]>([]);
     const animationTimeRef = useRef<number>(0);
     const pathGeneratorRef = useRef<PathGenerator | null>(null);

     // Alignment constants (similar to origami-flock)
     const REALIGNMENT_INTERVAL = 0.1; // Seconds between re-alignments
     const DERIVATIVE_SMOOTHING_FRAMES = 5; // Number of frames to smooth derivative
     const MAX_ANGLE_CHANGE = 90; // Maximum angle change per update for smooth transitions (degrees)
     const lastRealignmentTimeRef = useRef<number>(0);

     useEffect(() => {
          if (!mountRef.current) return;

          // Capture the current mount reference for cleanup
          const currentMount = mountRef.current;

          // Create path generator
          const pathGenerator = new PathGenerator({ cameraDistance, craneCount: 10 });
          pathGeneratorRef.current = pathGenerator;

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
               antialias: true,
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
          renderer.domElement.style.position = "absolute"; // Relative to parent section
          renderer.domElement.style.top = "0";
          renderer.domElement.style.left = "0";
          renderer.domElement.style.width = "100%";
          renderer.domElement.style.height = "100%";
          renderer.domElement.style.pointerEvents = "none"; // Allow clicks to pass through
          renderer.domElement.style.zIndex = isHeroSection ? "1" : "0"; // Hero behind content, sections behind content

          currentMount.appendChild(renderer.domElement);
          rendererRef.current = renderer;

          // Add crane instances with path animation
          let craneGroup: CraneGroup | null = null;
          let cranesLoaded = false;
          const craneCount = 10;

          // Generate paths for cranes
          const pathResult = pathGenerator.generateCranePaths(craneCount);
          pathsRef.current = pathResult.paths;
          cranePathDataRef.current = pathResult.pathData;
          pathZCoordinatesRef.current = pathResult.zCoordinates;

          // // Visualize the paths in black
          // pathLinesRef.current = PathGenerator.visualizePaths(scene, pathResult.paths, pathLinesRef.current);

          // Create a crane group
          craneGroup = new CraneGroup("test-cranes");

          // Load the crane OBJ file and create instances
          const objLoader = new OBJLoader();
          objLoader.load(
               "/crane-3D.obj",
               (objObject) => {
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
               },
               undefined,
               (error: unknown) => {
                    console.error("Error loading crane OBJ file:", error);
               }
          );

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

                    // Handle initial delay
                    if (pathData.isDelayActive) {
                         pathData.delayTimer -= deltaTime;
                         if (pathData.delayTimer <= 0) {
                              pathData.isDelayActive = false;
                              pathData.delayTimer = 0;
                         } else {
                              // Crane is still in delay phase, don't move it
                              return;
                         }
                    }

                    // Update progress along current path segment
                    pathData.pathProgress += travelSpeed * deltaTime;

                    // Check if we need to move to next segment or restart
                    if (pathData.pathProgress >= 1.0) {
                         pathData.currentPathIndex++;
                         pathData.pathProgress = 0.0;

                         // If we've reached the end, regenerate path and restart from beginning
                         if (pathData.currentPathIndex >= pathData.pathPoints.length - 1) {
                              // Regenerate a new random path for this crane
                              if (pathGeneratorRef.current) {
                                   pathGeneratorRef.current.regenerateSinglePath(pathData, index);
                              }
                              
                              // Add some variety to restart timing
                              pathData.pathProgress = Math.random() * 0.1;
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
                              pathData.derivativeHistory.forEach((vec) => smoothedVector.add(vec));
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
          type PathDataType = PathData;

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
               const xPositions = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((x) => x * scaleFactorForCamera);
               xLabels = xPositions.map((x, index) => {
                    const label = document.createElement("div");
                    label.textContent = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5][index].toString();
                    label.style.position = "absolute";
                    label.style.color = "#ff0000";
                    label.style.fontSize = "14px";
                    label.style.pointerEvents = "none";
                    label.style.zIndex = "2";
                    label.style.transform = "translate(-50%, -50%)";
                    label.style.fontWeight = "bold";
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
                    const xPositions = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((x) => x * scaleFactorForCamera);
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

          window.addEventListener("resize", handleResize);

          // Cleanup
          return () => {
               window.removeEventListener("resize", handleResize);
               if (currentMount && renderer.domElement) {
                    currentMount.removeChild(renderer.domElement);
               }

               // Clean up path lines
               pathLinesRef.current.forEach((line) => {
                    if (line.geometry) line.geometry.dispose();
                    if (line.material) {
                         if (Array.isArray(line.material)) {
                              line.material.forEach((mat) => mat.dispose());
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
                    xLabels.forEach((label) => {
                         currentMount.removeChild(label);
                    });
               }
          };
     }, [showAxes, isHeroSection, cameraDistance, craneScale, wingFlapSpeed, pathSpeed]);

     return (
          <>
               <div
                    ref={mountRef}
                    className={`three-d-container ${isHeroSection ? "hero-3d" : "section-3d"}`}
                    style={{
                         position: "absolute", // Relative to parent section
                         top: 0,
                         left: 0,
                         width: "100%",
                         height: "100%",
                         pointerEvents: "none",
                         zIndex: isHeroSection ? 1 : 0,
                         margin: 0,
                         padding: 0,
                    }}
               />

               {/* Z-axis coordinates display */}
               {/* <div
                    style={{
                         position: "absolute",
                         top: "20px",
                         left: "20px",
                         zIndex: 10,
                         background: "rgba(255, 255, 255, 0.9)",
                         padding: "10px",
                         borderRadius: "6px",
                         boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                         fontSize: "12px",
                         fontFamily: "monospace",
                         maxHeight: "300px",
                         overflowY: "auto",
                         minWidth: "200px",
                    }}
               >
                    <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Path Z-Coordinates</div>
                    <div style={{ marginBottom: "6px" }}>
                         <strong>Start Z:</strong> [{pathZCoordinatesRef.current.startZ.join(", ")}]
                    </div>
                    <div>
                         <strong>End Z:</strong> [{pathZCoordinatesRef.current.endZ.join(", ")}]
                    </div>
               </div> */}
          </>
     );
}

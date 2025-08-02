"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "../../utils/three/OBJLoader.js";
import { CraneGroup, CraneInstance, CraneUtilities } from "./origami-crane.js";

interface CraneAnimationDisplayProps {
     width?: number;
     height?: number;
     craneScale?: number;
     wingFlapSpeed?: number;
     backgroundColor?: string;
     showControls?: boolean;
}

export default function CraneAnimationDisplay({
     width = 300,
     height = 300,
     craneScale = 2.0,
     wingFlapSpeed = 4.0,
     backgroundColor = "transparent",
     showControls = false,
}: CraneAnimationDisplayProps) {
     const mountRef = useRef<HTMLDivElement>(null);
     const [isReady, setIsReady] = useState(false);
     const [isAnimating, setIsAnimating] = useState(true);

     // Refs for Three.js objects
     const sceneRef = useRef<THREE.Scene | null>(null);
     const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
     const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
     const craneRef = useRef<CraneInstance | null>(null);
     const craneGroupRef = useRef<CraneGroup | null>(null);
     const animationIdRef = useRef<number | null>(null);

     const toggleAnimation = () => {
          if (!craneRef.current) return;

          if (isAnimating) {
               craneRef.current.stopWingFlap();
               setIsAnimating(false);
          } else {
               craneRef.current.startWingFlap();
               setIsAnimating(true);
          }
     };

     useEffect(() => {
          if (!mountRef.current) return;

          const currentMount = mountRef.current;

          // Scene setup
          const scene = new THREE.Scene();
          sceneRef.current = scene;

          // Camera setup - positioned to show the crane nicely (zoomed in further 33%)
          const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
          camera.position.set(1.34, 0.89, 1.34);
          camera.lookAt(0, 0, 0);
          cameraRef.current = camera;

          // Renderer setup
          const renderer = new THREE.WebGLRenderer({
               alpha: backgroundColor === "transparent",
               antialias: true,
          });

          renderer.setSize(width, height);
          renderer.setPixelRatio(window.devicePixelRatio);

          if (backgroundColor !== "transparent") {
               renderer.setClearColor(backgroundColor);
          } else {
               renderer.setClearColor(0x000000, 0);
          }

          currentMount.appendChild(renderer.domElement);
          rendererRef.current = renderer;

          // Add lighting for better crane visibility
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
          scene.add(ambientLight);

          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
          directionalLight.position.set(5, 5, 5);
          scene.add(directionalLight);

          // Create crane group
          const craneGroup = new CraneGroup("animation-crane");
          craneGroupRef.current = craneGroup;

          // Load the crane OBJ file
          const objLoader = new OBJLoader();
          objLoader.load(
               "/crane-3D.obj",
               (objObject) => {
                    // Create single crane instance
                    const crane = new CraneInstance("animation-crane-1");
                    craneRef.current = crane;

                    // Load the crane from OBJ object
                    crane.loadFromOBJObject(objObject.clone());

                    // Position crane at origin
                    crane.setPosition(0, 0, 0);

                    // Rotate crane to face camera at ~45 degree angle
                    if (crane.craneObject) {
                         crane.craneObject.rotation.y = Math.PI / 4; // 45 degrees rotation around Y-axis
                         crane.craneObject.rotation.x = -Math.PI / 8; // Slight tilt for better viewing angle

                         // Mirror the crane horizontally
                         crane.craneObject.scale.x = -1;
                    }

                    // Process the crane instance with white color and wireframe
                    CraneUtilities.processCraneInstance(crane, craneScale, 2.0);

                    // Add crane to the group
                    craneGroup.addCrane(crane);

                    // Set crane to white color with wireframe
                    craneGroup.setAllCranesWhite(true);
                    craneGroup.setCraneTransparency(1.0);
                    craneGroup.setWireframeWidth(2);

                    // Apply materials
                    craneGroup.applyMaterialsToAllCranes(false); // Use uniform white color

                    // Add crane object to scene
                    if (crane.craneObject) {
                         scene.add(crane.craneObject);
                    }

                    // Start wing flapping animation
                    crane.startWingFlap();

                    setIsReady(true);
               },
               undefined,
               (error: unknown) => {
                    console.error("Error loading crane OBJ file:", error);
               }
          );

          // Animation loop
          const animate = () => {
               animationIdRef.current = requestAnimationFrame(animate);

               if (craneRef.current && isAnimating) {
                    craneRef.current.updateAnimation(wingFlapSpeed, true);
               }

               if (renderer && scene && camera) {
                    renderer.render(scene, camera);
               }
          };
          animate();

          // Cleanup
          return () => {
               if (animationIdRef.current) {
                    cancelAnimationFrame(animationIdRef.current);
               }
               if (currentMount && renderer.domElement) {
                    currentMount.removeChild(renderer.domElement);
               }
               renderer.dispose();
          };
     }, [width, height, craneScale, wingFlapSpeed, backgroundColor, isAnimating]);

     return (
          <div className="crane-animation-display">
               {/* Three.js canvas container */}
               <div
                    ref={mountRef}
                    style={{
                         width: `${width}px`,
                         height: `${height}px`,
                         border: "1px solid #ddd",
                         borderRadius: "8px",
                         overflow: "hidden",
                         position: "relative",
                         backgroundColor:
                              backgroundColor === "transparent" ? "rgba(240, 240, 240, 0.5)" : backgroundColor,
                    }}
               />

               {/* Controls (if enabled) */}
               {showControls && (
                    <div className="controls" style={{ marginTop: "10px", textAlign: "center" }}>
                         <button
                              onClick={toggleAnimation}
                              disabled={!isReady}
                              style={{
                                   padding: "6px 12px",
                                   backgroundColor: isAnimating ? "#dc3545" : "#28a745",
                                   color: "white",
                                   border: "none",
                                   borderRadius: "4px",
                                   cursor: !isReady ? "not-allowed" : "pointer",
                                   fontSize: "12px",
                              }}
                         >
                              {isAnimating ? "Stop Animation" : "Start Animation"}
                         </button>
                    </div>
               )}

               {/* Status */}
               {!isReady && (
                    <div
                         style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              padding: "10px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              zIndex: 10,
                         }}
                    >
                         Loading crane model...
                    </div>
               )}
          </div>
     );
}

"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OBJLoader } from "../../utils/three/OBJLoader.js";
import { CraneGroup, CraneInstance, CraneUtilities } from "./origami-crane.js";

interface CraneGifGeneratorProps {
     width?: number;
     height?: number;
     craneScale?: number;
     wingFlapSpeed?: number;
     duration?: number; // Duration in seconds for one complete cycle
     backgroundColor?: string;
     wireframeColor?: string;
     craneColor?: string;
     autoGenerate?: boolean;
     onGifGenerated?: (gifDataUrl: string) => void;
}

export default function CraneGifGenerator({
     width = 400,
     height = 400,
     craneScale = 2.0,
     wingFlapSpeed = 4.0,
     duration = 2.0,
     backgroundColor = "transparent",
     autoGenerate = true,
     onGifGenerated,
}: CraneGifGeneratorProps) {
     const mountRef = useRef<HTMLDivElement>(null);
     const [isGenerating, setIsGenerating] = useState(false);
     const [gifDataUrl, setGifDataUrl] = useState<string>("");
     const [isReady, setIsReady] = useState(false);

     // Refs for Three.js objects
     const sceneRef = useRef<THREE.Scene | null>(null);
     const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
     const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
     const craneRef = useRef<CraneInstance | null>(null);
     const craneGroupRef = useRef<CraneGroup | null>(null);

     const generateGif = useCallback(async () => {
          if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !craneRef.current) {
               console.warn("Scene not ready for GIF generation");
               return;
          }

          setIsGenerating(true);

          try {
               // Import gif.js dynamically to avoid server-side issues
               const { default: GIF } = await import("gif.js");

               const scene = sceneRef.current;
               const renderer = rendererRef.current;
               const camera = cameraRef.current;
               const crane = craneRef.current;

               // Create GIF encoder
               const gif = new GIF({
                    workers: 2,
                    quality: 10,
                    width: width,
                    height: height,
                    workerScript: "/gif.worker.js", // We'll need to add this to public folder
               });

               const fps = 30;
               const totalFrames = Math.floor(duration * fps);
               const frameInterval = 1000 / fps; // ms per frame

               console.log(`Generating GIF: ${totalFrames} frames at ${fps} FPS`);

               // Reset crane animation state
               crane.stopWingFlap();
               crane.startWingFlap();

               // Generate frames
               for (let frame = 0; frame < totalFrames; frame++) {
                    // Update crane wing flap animation
                    crane.updateAnimation(wingFlapSpeed, true);

                    // Render the frame
                    renderer.render(scene, camera);

                    // Get the canvas and add to GIF
                    const canvas = renderer.domElement;

                    // Convert to proper format for gif.js
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                         gif.addFrame(ctx, { delay: frameInterval });
                    }

                    // Small delay to allow rendering to complete
                    await new Promise((resolve) => setTimeout(resolve, 10));
               }

               // Render the GIF
               gif.on("finished", (blob: Blob) => {
                    const url = URL.createObjectURL(blob);
                    setGifDataUrl(url);
                    if (onGifGenerated) {
                         onGifGenerated(url);
                    }
                    setIsGenerating(false);
                    console.log("GIF generation completed!");
               });

               gif.render();
          } catch (error) {
               console.error("Error generating GIF:", error);
               setIsGenerating(false);
          }
     }, [width, height, duration, wingFlapSpeed, onGifGenerated]);

     useEffect(() => {
          if (!mountRef.current) return;

          const currentMount = mountRef.current;

          // Scene setup
          const scene = new THREE.Scene();
          sceneRef.current = scene;

          // Camera setup - positioned to show the crane nicely
          const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
          camera.position.set(3, 2, 3);
          camera.lookAt(0, 0, 0);
          cameraRef.current = camera;

          // Renderer setup
          const renderer = new THREE.WebGLRenderer({
               alpha: backgroundColor === "transparent",
               antialias: true,
               preserveDrawingBuffer: true, // Important for capturing frames
          });

          renderer.setSize(width, height);
          renderer.setPixelRatio(1); // Use 1:1 pixel ratio for consistent GIF output

          if (backgroundColor !== "transparent") {
               renderer.setClearColor(backgroundColor);
          } else {
               renderer.setClearColor(0x000000, 0);
          }

          currentMount.appendChild(renderer.domElement);
          rendererRef.current = renderer;

          // Add lighting for better crane visibility
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambientLight);

          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
          directionalLight.position.set(5, 5, 5);
          scene.add(directionalLight);

          // Create crane group
          const craneGroup = new CraneGroup("gif-crane");
          craneGroupRef.current = craneGroup;

          // Load the crane OBJ file
          const objLoader = new OBJLoader();
          objLoader.load(
               "/crane-3D.obj",
               (objObject) => {
                    // Create single crane instance
                    const crane = new CraneInstance("gif-crane-1");
                    craneRef.current = crane;

                    // Load the crane from OBJ object
                    crane.loadFromOBJObject(objObject.clone());

                    // Position crane at origin
                    crane.setPosition(0, 0, 0);

                    // Process the crane instance with white color and wireframe
                    CraneUtilities.processCraneInstance(crane, craneScale, 2.0);

                    // Add crane to the group
                    craneGroup.addCrane(crane);

                    // Set crane to white color
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

                    // Auto-generate GIF if enabled
                    if (autoGenerate) {
                         // Small delay to ensure everything is ready
                         setTimeout(() => {
                              generateGif();
                         }, 500);
                    }
               },
               undefined,
               (error: unknown) => {
                    console.error("Error loading crane OBJ file:", error);
               }
          );

          // Animation loop for preview
          let animationId: number;
          const animate = () => {
               animationId = requestAnimationFrame(animate);

               if (craneRef.current) {
                    craneRef.current.updateAnimation(wingFlapSpeed, true);
               }

               renderer.render(scene, camera);
          };
          animate();

          // Cleanup
          return () => {
               if (animationId) {
                    cancelAnimationFrame(animationId);
               }
               if (currentMount && renderer.domElement) {
                    currentMount.removeChild(renderer.domElement);
               }
               renderer.dispose();
          };
     }, [width, height, craneScale, wingFlapSpeed, backgroundColor, autoGenerate, generateGif]);

     return (
          <div className="crane-gif-generator">
               {/* Three.js canvas container */}
               <div
                    ref={mountRef}
                    style={{
                         width: `${width}px`,
                         height: `${height}px`,
                         border: "1px solid #ccc",
                         borderRadius: "8px",
                         overflow: "hidden",
                         position: "relative",
                    }}
               />

               {/* Controls */}
               <div className="controls" style={{ marginTop: "10px", textAlign: "center" }}>
                    <button
                         onClick={generateGif}
                         disabled={isGenerating || !isReady}
                         style={{
                              padding: "8px 16px",
                              backgroundColor: isGenerating ? "#ccc" : "#0070f3",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: isGenerating ? "not-allowed" : "pointer",
                              fontSize: "14px",
                         }}
                    >
                         {isGenerating ? "Generating GIF..." : "Generate GIF"}
                    </button>
               </div>

               {/* Generated GIF display */}
               {gifDataUrl && (
                    <div style={{ marginTop: "15px", textAlign: "center" }}>
                         <h4>Generated GIF:</h4>
                         <img
                              src={gifDataUrl}
                              alt="Origami Crane Wing Flap Animation"
                              style={{
                                   border: "1px solid #ddd",
                                   borderRadius: "8px",
                                   maxWidth: "100%",
                              }}
                         />
                         <div style={{ marginTop: "10px" }}>
                              <a
                                   href={gifDataUrl}
                                   download="origami-crane-animation.gif"
                                   style={{
                                        display: "inline-block",
                                        padding: "8px 16px",
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        textDecoration: "none",
                                        borderRadius: "4px",
                                        fontSize: "14px",
                                   }}
                              >
                                   Download GIF
                              </a>
                         </div>
                    </div>
               )}

               {/* Status */}
               {isGenerating && (
                    <div style={{ marginTop: "10px", textAlign: "center", color: "#666" }}>
                         <p>Generating animated GIF... This may take a few moments.</p>
                    </div>
               )}
          </div>
     );
}

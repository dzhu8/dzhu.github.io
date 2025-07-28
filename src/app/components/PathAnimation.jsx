"use client";

import { useEffect, useRef, useState } from "react";
import { createAnimatorFromPathData } from "../utils/pathAnimator";
import { generateRandomPath } from "../utils/pathGenerator";

export default function PathAnimation({
     svgPath,
     pathId = "curvedPath",
     iconId = "pathIcon",
     duration = 5000,
     hidePath = true,
     iconContent = '<circle r="5" fill="currentColor" />',
     width = 300,
     height = 200,
     pathCount = 3,
     switchInterval = 15000, // Time in ms to switch between paths (default 15 seconds)
     pathOptions = {
          points: 5,
          closed: true,
          types: ["random", "circular", "wave", "zigzag"],
     },
     currentPathIndex = 0, // New prop to set initial path index
}) {
     const containerRef = useRef(null);
     const [error, setError] = useState(null);
     const [pathAnimator, setPathAnimator] = useState(null);
     const [generatedPaths, setGeneratedPaths] = useState([]);
     // Use the provided initial path index instead of always starting at 0
     const [activePathIndex, setActivePathIndex] = useState(currentPathIndex);
     const switchTimerRef = useRef(null);

     // Generate multiple random paths on initial render
     useEffect(() => {
          if (typeof window === "undefined" || !containerRef.current) return;

          // Only generate paths if we're not using an SVG file path
          if (!svgPath) {
               const containerWidth = width || containerRef.current.clientWidth || 300;
               const containerHeight = height || containerRef.current.clientHeight || 200;

               // Generate multiple random paths
               const paths = [];
               for (let i = 0; i < pathCount; i++) {
                    // Select a random path type from the available types
                    const typeIndex = Math.floor(Math.random() * pathOptions.types.length);
                    const pathType = pathOptions.types[typeIndex];

                    // Generate path data with the selected type
                    const pathData = generateRandomPath({
                         width: containerWidth,
                         height: containerHeight,
                         points: pathOptions.points,
                         closed: pathOptions.closed,
                         type: pathType,
                    });

                    paths.push(pathData);
               }

               setGeneratedPaths(paths);

               // Clean up any existing SVGs
               while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild);
               }
          }

          return () => {
               if (switchTimerRef.current) {
                    clearInterval(switchTimerRef.current);
               }
          };
     }, [svgPath, width, height, pathCount, pathOptions]);

     // Handle path animation and switching
     useEffect(() => {
          // Only proceed if we have generated paths and are in the browser
          if (typeof window === "undefined" || !containerRef.current || (generatedPaths.length === 0 && !svgPath))
               return;

          // Clean up any previous animations
          if (pathAnimator) {
               pathAnimator.stop();
          }

          try {
               if (svgPath) {
                    // Traditional method using provided SVG path
                    fetch(svgPath)
                         .then((response) => {
                              if (!response.ok) {
                                   throw new Error(`Failed to load SVG (${response.status})`);
                              }
                              return response.text();
                         })
                         .then((data) => {
                              // Create a container for the SVG
                              const svgContainer = document.createElement("div");
                              svgContainer.innerHTML = data;

                              // Clear container before appending
                              while (containerRef.current.firstChild) {
                                   containerRef.current.removeChild(containerRef.current.firstChild);
                              }

                              containerRef.current.appendChild(svgContainer);

                              // The SVG content should be extracted from the loaded SVG file
                              const paperPlaneSvg = svgContainer.querySelector("svg");
                              const paperPlaneContent = paperPlaneSvg ? paperPlaneSvg.innerHTML : iconContent;

                              // For the Paper_Plane.svg, we use custom icon content from the loaded SVG
                              const customIconContent = paperPlaneSvg
                                   ? `<g transform="scale(0.5) translate(-25, -25)">${paperPlaneContent}</g>`
                                   : iconContent;

                              // If we're using random paths with the SVG icon
                              if (generatedPaths.length > 0) {
                                   // Use current path from generated paths
                                   const currentPath = generatedPaths[activePathIndex];

                                   // Create animator with the current path
                                   const animator = createAnimatorFromPathData({
                                        pathData: currentPath,
                                        container: containerRef.current,
                                        iconContent: customIconContent,
                                        pathId: `generated-${pathId}-${activePathIndex}`,
                                        iconId: `generated-${iconId}-${activePathIndex}`,
                                        width,
                                        height,
                                        animationOptions: {
                                             duration,
                                             loop: true,
                                             hidePath,
                                             rotationOffset: 90, // Adjust rotation for paper plane to point in direction of movement
                                        },
                                   });

                                   setPathAnimator(animator);
                                   setError(null);

                                   // Set up the interval to switch paths
                                   if (switchTimerRef.current) {
                                        clearInterval(switchTimerRef.current);
                                   }

                                   if (generatedPaths.length > 1) {
                                        switchTimerRef.current = setInterval(() => {
                                             // Select a random path that's different from the current one
                                             let nextIndex;
                                             do {
                                                  nextIndex = Math.floor(Math.random() * generatedPaths.length);
                                             } while (nextIndex === activePathIndex && generatedPaths.length > 1);

                                             setActivePathIndex(nextIndex);
                                        }, switchInterval);
                                   }
                              } else {
                                   // Initialize the path animator with the path from the SVG
                                   const animator = createAnimatorFromPathData({
                                        pathData: document.querySelector(`#${pathId}`)?.getAttribute("d"),
                                        container: containerRef.current,
                                        iconContent: customIconContent,
                                        pathId,
                                        iconId,
                                        width,
                                        height,
                                        animationOptions: {
                                             duration,
                                             loop: true,
                                             hidePath,
                                             rotationOffset: 90, // Adjust rotation for paper plane
                                        },
                                   });

                                   setPathAnimator(animator);
                                   setError(null);
                              }
                         })
                         .catch((error) => {
                              console.error("Error loading SVG:", error);
                              setError(`Error loading SVG: ${error.message}`);
                         });
               } else if (generatedPaths.length > 0) {
                    // Use the current path from our generated paths
                    const currentPath = generatedPaths[activePathIndex];

                    // Clean up the container first
                    while (containerRef.current.firstChild) {
                         containerRef.current.removeChild(containerRef.current.firstChild);
                    }

                    // Create animator with the current path
                    const animator = createAnimatorFromPathData({
                         pathData: currentPath,
                         container: containerRef.current,
                         iconContent,
                         pathId: `generated-${pathId}-${activePathIndex}`,
                         iconId: `generated-${iconId}-${activePathIndex}`,
                         width,
                         height,
                         animationOptions: {
                              duration,
                              loop: true,
                              hidePath,
                         },
                    });

                    setPathAnimator(animator);
                    setError(null);

                    // Set up the interval to switch paths
                    if (switchTimerRef.current) {
                         clearInterval(switchTimerRef.current);
                    }

                    if (generatedPaths.length > 1) {
                         switchTimerRef.current = setInterval(() => {
                              // Select a random path that's different from the current one
                              let nextIndex;
                              do {
                                   nextIndex = Math.floor(Math.random() * generatedPaths.length);
                              } while (nextIndex === activePathIndex && generatedPaths.length > 1);

                              setActivePathIndex(nextIndex);
                         }, switchInterval);
                    }
               }
          } catch (err) {
               console.error("Error in PathAnimation:", err);
               setError(`Error in PathAnimation: ${err.message}`);
          }

          // Clean up function
          return () => {
               if (pathAnimator) {
                    pathAnimator.stop();
               }
               if (switchTimerRef.current) {
                    clearInterval(switchTimerRef.current);
               }
          };
     }, [
          svgPath,
          pathId,
          iconId,
          duration,
          hidePath,
          iconContent,
          width,
          height,
          generatedPaths,
          activePathIndex,
          switchInterval,
     ]);

     return (
          <div className="path-animation">
               {error ? (
                    <div className="text-red-500 p-3 border border-red-300 rounded mb-4">{error}</div>
               ) : (
                    <div
                         ref={containerRef}
                         className="relative"
                         style={{ minHeight: `${height}px`, minWidth: `${width}px` }}
                    ></div>
               )}
          </div>
     );
}

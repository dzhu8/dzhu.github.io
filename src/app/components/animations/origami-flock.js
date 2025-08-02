// Import Three.js modules
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { CraneInstance, CraneGroup, CraneUtilities } from "./origami-crane.js";
import { QuaternionTransforms } from "../utilities/quaternion-transforms.js";

// Global variables
let scene, camera, renderer, controls;
let craneInstances = [];
let craneGroup = null;

// Compass 3D variables
let compassScene, compassCamera, compassRenderer, compassControls;
let compassRaycaster, compassMouse;
let compassAxes = []; // Will store clickable axis objects

// Viewing window dimensions and cube parameters
let viewWidth, viewHeight, viewDepth;
let cubeStartFace, cubeEndFace;
let pathPairs = [];
let flightPaths = [];

// Default parameters
let currentCraneCount = 50;
let currentCraneScale = 0.02;
let currentScaleMultiplier = 1.0;
let currentSpeedMultiplier = 1.0;
let currentWingSpeedMultiplier = 0.7;

// Animation parameters
const REALIGNMENT_INTERVAL = 0.1; // Seconds between re-alignments (every 0.1 seconds)
const DERIVATIVE_SMOOTHING_FRAMES = 5; // Number of frames to smooth derivative (previous 5 frames)
const MAX_ANGLE_CHANGE = 90; // Maximum angle change per update for smooth transitions (degrees)
const TRAVEL_SPEED = 10.0; // Base speed along the path (will be multiplied by currentSpeedMultiplier)
const BASE_WING_FLAP_SPEED = 5.25; // Base wing flap speed (0.7x of original 7.5)
const PATH_RESOLUTION = 200; // Number of points per path for smooth curves

// Crane data storage
let craneData = []; // Will store individual crane parameters and state

// Animation state
let animationTime = 0; // Current animation time in seconds
let lastRealignmentTime = 0; // Time of last re-alignment

// Path visualization
let pathLines = []; // Black lines showing flight paths

function initOrigamiTestFlight() {
     const container = document.getElementById("container");
     if (!container) {
          console.error("Container element not found");
          return;
     }

     // Calculate viewing window dimensions (10% and 90% of visible axes)
     calculateViewingDimensions();

     // Create scene
     scene = new THREE.Scene();
     scene.background = new THREE.Color(0x87ceeb); // Sky blue background

     // Create camera (positioned to view from positive X-axis by default)
     camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
     camera.position.set(50, 0, 0); // Default to positive X-axis view

     // Create renderer
     renderer = new THREE.WebGLRenderer({ antialias: true });
     renderer.setSize(window.innerWidth, window.innerHeight);
     renderer.shadowMap.enabled = true;
     renderer.shadowMap.type = THREE.PCFSoftShadowMap;
     renderer.setClearColor(0x87ceeb, 1); // Sky blue background
     container.appendChild(renderer.domElement);

     // Add orbit controls
     controls = new OrbitControls(camera, renderer.domElement);
     controls.enableDamping = true;
     controls.dampingFactor = 0.05;
     controls.screenSpacePanning = false;
     controls.minDistance = 5;
     controls.maxDistance = 100;
     controls.maxPolarAngle = Math.PI / 1.2;

     // Add lighting
     setupLighting();

     // Setup UI controls
     setupControls();

     // Setup 3D compass
     setupCompassControls();

     // Generate initial crane parameters and paths
     generateCranePaths(currentCraneCount);

     // Load the crane models
     loadCraneModels();

     // Setup window resize handler
     window.addEventListener("resize", onWindowResize, false);

     // Start animation loop
     animate();
}

function calculateViewingDimensions() {
     // Calculate hypothetical cube dimensions based on camera frustum at a reasonable distance
     const distance = 30; // Distance from camera to focus point
     const fov = (75 * Math.PI) / 180; // Convert FOV to radians
     const aspect = window.innerWidth / window.innerHeight;

     // Calculate visible dimensions at the focus distance
     viewHeight = 2 * Math.tan(fov / 2) * distance;
     viewWidth = viewHeight * aspect;
     viewDepth = Math.max(viewWidth, viewHeight); // Use larger dimension for depth

     // Define cube boundaries (10% to 90% of visible dimensions)
     const xMin = -viewWidth * 0.4; // 10% from left edge
     const xMax = viewWidth * 0.4; // 90% from left edge
     const yMin = -viewHeight * 0.4;
     const yMax = viewHeight * 0.4;
     const zMin = -viewDepth * 0.4;
     const zMax = viewDepth * 0.4;

     // Set start face (parallel to z-axis, at zMin)
     cubeStartFace = {
          x: { min: xMin, max: xMax },
          y: { min: yMin, max: yMax },
          z: zMin,
     };

     // Set end face (parallel to z-axis, at zMax)
     cubeEndFace = {
          x: { min: xMin, max: xMax },
          y: { min: yMin, max: yMax },
          z: zMax,
     };
}

function setupLighting() {
     // Ambient light - soft overall illumination
     const ambientLight = new THREE.AmbientLight(0xf8f8ff, 0.4);
     scene.add(ambientLight);

     // // Main directional light - positioned to illuminate from upper-right-front
     // // Positioned outside the animation area at roughly 2x the viewing distance
     // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
     // directionalLight.position.set(60, 40, 50);
     // directionalLight.castShadow = true;
     // directionalLight.shadow.mapSize.width = 2048;
     // directionalLight.shadow.mapSize.height = 2048;
     // directionalLight.shadow.camera.near = 10;
     // directionalLight.shadow.camera.far = 150;
     // // Adjust shadow camera to cover the animation area properly
     // directionalLight.shadow.camera.left = -40;
     // directionalLight.shadow.camera.right = 40;
     // directionalLight.shadow.camera.top = 40;
     // directionalLight.shadow.camera.bottom = -40;
     // scene.add(directionalLight);

     // // Fill light with sky blue tint - positioned from the opposite side
     // // Softer lighting from lower-left-back to fill in shadows
     // const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.25);
     // fillLight.position.set(-30, -15, -25);
     // scene.add(fillLight);

     // // Rim light for highlights - positioned above and behind the animation area
     // // Creates nice edge lighting on the cranes
     // const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
     // rimLight.position.set(-20, 35, -30);
     // scene.add(rimLight);

     // // Subtle point light for additional depth - positioned well outside animation area
     // const pointLight = new THREE.PointLight(0xffffff, 0.3, 120);
     // pointLight.position.set(25, 30, 35);
     // scene.add(pointLight);
}

function setupControls() {
     // Crane count input
     const craneCountInput = document.getElementById("craneCount");
     const setCranesButton = document.getElementById("setCranes");

     setCranesButton.addEventListener("click", () => {
          const newCount = parseInt(craneCountInput.value);
          if (newCount >= 1 && newCount <= 250) {
               currentCraneCount = newCount;
               regenerateCranes();
          }
     });

     // Scale slider
     const scaleSlider = document.getElementById("scaleSlider");
     const scaleValue = document.getElementById("scaleValue");

     scaleSlider.addEventListener("input", (e) => {
          currentScaleMultiplier = parseFloat(e.target.value);
          scaleValue.textContent = `${currentScaleMultiplier.toFixed(1)}x`;
          updateCraneScales();
     });

     // Speed slider
     const speedSlider = document.getElementById("speedSlider");
     const speedValue = document.getElementById("speedValue");

     speedSlider.addEventListener("input", (e) => {
          currentSpeedMultiplier = parseFloat(e.target.value);
          speedValue.textContent = `${currentSpeedMultiplier.toFixed(1)}x`;
          console.log(`Speed updated to ${currentSpeedMultiplier}x`);
     });

     // Wing flap speed slider
     const wingSpeedSlider = document.getElementById("wingSpeedSlider");
     const wingSpeedValue = document.getElementById("wingSpeedValue");

     wingSpeedSlider.addEventListener("input", (e) => {
          currentWingSpeedMultiplier = parseFloat(e.target.value);
          wingSpeedValue.textContent = `${currentWingSpeedMultiplier.toFixed(1)}x`;
          console.log(`Wing flap speed updated to ${currentWingSpeedMultiplier}x`);
     });
}

function setupCompassControls() {
     // Create 3D compass scene
     create3DCompass();
     console.log("3D Compass controls ready");
}

function create3DCompass() {
     const compassContainer = document.getElementById("compass3d");
     if (!compassContainer) {
          console.warn("Compass container not found");
          return;
     }

     // Create compass scene
     compassScene = new THREE.Scene();
     compassScene.background = new THREE.Color(0xf8f9fa);

     // Create compass camera
     compassCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
     compassCamera.position.set(4, 3, 4);

     // Create compass renderer
     compassRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
     compassRenderer.setSize(150, 150);
     compassRenderer.setClearColor(0xf8f9fa, 1);
     compassContainer.appendChild(compassRenderer.domElement);

     // Add compass controls
     compassControls = new OrbitControls(compassCamera, compassRenderer.domElement);
     compassControls.enableDamping = true;
     compassControls.dampingFactor = 0.05;
     compassControls.enablePan = false;
     compassControls.enableZoom = false;
     compassControls.minDistance = 5;
     compassControls.maxDistance = 8;

     // Create raycaster for mouse interaction
     compassRaycaster = new THREE.Raycaster();
     compassMouse = new THREE.Vector2();

     // Add lighting to compass scene
     const compassAmbientLight = new THREE.AmbientLight(0x404040, 0.6);
     compassScene.add(compassAmbientLight);

     const compassDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
     compassDirectionalLight.position.set(5, 5, 5);
     compassScene.add(compassDirectionalLight);

     // Create compass geometry
     createCompassGeometry();

     // Add mouse event listeners
     compassRenderer.domElement.addEventListener("click", onCompassClick, false);
     compassRenderer.domElement.addEventListener("mousemove", onCompassMouseMove, false);

     // Start compass animation
     animateCompass();

     // Show view controls immediately when compass is ready
     const viewControlsDiv = document.getElementById("viewControls");
     if (viewControlsDiv) {
          viewControlsDiv.style.display = "block";
          console.log("View controls shown");
     } else {
          console.warn("View controls div not found");
     }
}

function createCompassGeometry() {
     // Create blue origin sphere
     const originGeometry = new THREE.SphereGeometry(0.3, 16, 16);
     const originMaterial = new THREE.MeshLambertMaterial({ color: 0x007bff });
     const originSphere = new THREE.Mesh(originGeometry, originMaterial);
     compassScene.add(originSphere);

     // Create cylindrical axes
     const axisRadius = 0.08;
     const axisLength = 2.5;
     const cylinderGeometry = new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, 8);

     // Axis colors and positions
     const axisConfig = [
          {
               direction: "posX",
               color: 0xff4444,
               position: [axisLength / 2, 0, 0],
               rotation: [0, 0, -Math.PI / 2],
               label: "+X",
          },
          {
               direction: "negX",
               color: 0xaa2222,
               position: [-axisLength / 2, 0, 0],
               rotation: [0, 0, Math.PI / 2],
               label: "-X",
          },
          { direction: "posY", color: 0x44ff44, position: [0, axisLength / 2, 0], rotation: [0, 0, 0], label: "+Y" },
          {
               direction: "negY",
               color: 0x22aa22,
               position: [0, -axisLength / 2, 0],
               rotation: [Math.PI, 0, 0],
               label: "-Y",
          },
          {
               direction: "posZ",
               color: 0x4444ff,
               position: [0, 0, axisLength / 2],
               rotation: [Math.PI / 2, 0, 0],
               label: "+Z",
          },
          {
               direction: "negZ",
               color: 0x2222aa,
               position: [0, 0, -axisLength / 2],
               rotation: [-Math.PI / 2, 0, 0],
               label: "-Z",
          },
     ];

     compassAxes = []; // Clear existing axes

     axisConfig.forEach((config) => {
          // Create cylinder for axis
          const material = new THREE.MeshLambertMaterial({ color: config.color });
          const cylinder = new THREE.Mesh(cylinderGeometry.clone(), material);

          // Position and rotate
          cylinder.position.set(...config.position);
          cylinder.rotation.set(...config.rotation);

          // Store direction for click handling
          cylinder.userData = { direction: config.direction, label: config.label };

          // Add hover effect material
          cylinder.userData.originalColor = config.color;
          cylinder.userData.hoverColor =
               config.color === 0xff4444
                    ? 0xff6666
                    : config.color === 0xaa2222
                      ? 0xcc4444
                      : config.color === 0x44ff44
                        ? 0x66ff66
                        : config.color === 0x22aa22
                          ? 0x44cc44
                          : config.color === 0x4444ff
                            ? 0x6666ff
                            : 0x4444cc;

          compassScene.add(cylinder);
          compassAxes.push(cylinder);

          // Create end sphere for better visual feedback
          const endSphereGeometry = new THREE.SphereGeometry(axisRadius * 1.5, 8, 8);
          const endSphereMaterial = new THREE.MeshLambertMaterial({ color: config.color });
          const endSphere = new THREE.Mesh(endSphereGeometry, endSphereMaterial);

          // Position at the far end of the cylinder
          const endPosition = [...config.position];
          const direction = config.direction.includes("pos") ? 1 : -1;
          if (config.direction.includes("X")) endPosition[0] = direction * (axisLength / 2 + axisRadius * 1.5);
          if (config.direction.includes("Y")) endPosition[1] = direction * (axisLength / 2 + axisRadius * 1.5);
          if (config.direction.includes("Z")) endPosition[2] = direction * (axisLength / 2 + axisRadius * 1.5);

          endSphere.position.set(...endPosition);
          endSphere.userData = cylinder.userData; // Copy the same interaction data
          endSphere.userData.originalColor = config.color;
          endSphere.userData.hoverColor = cylinder.userData.hoverColor;

          compassScene.add(endSphere);
          compassAxes.push(endSphere);
     });
}

function onCompassClick(event) {
     // Calculate mouse position in normalized device coordinates
     const rect = compassRenderer.domElement.getBoundingClientRect();
     compassMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
     compassMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

     // Raycast to find intersected objects
     compassRaycaster.setFromCamera(compassMouse, compassCamera);
     const intersects = compassRaycaster.intersectObjects(compassAxes);

     if (intersects.length > 0) {
          const clickedObject = intersects[0].object;
          const direction = clickedObject.userData.direction;

          console.log(`Compass clicked: ${direction} (${clickedObject.userData.label})`);
          setCameraView(direction);
     }
}

function onCompassMouseMove(event) {
     // Calculate mouse position
     const rect = compassRenderer.domElement.getBoundingClientRect();
     compassMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
     compassMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

     // Raycast to find intersected objects
     compassRaycaster.setFromCamera(compassMouse, compassCamera);
     const intersects = compassRaycaster.intersectObjects(compassAxes);

     // Reset all axes to original color
     compassAxes.forEach((axis) => {
          if (axis.material && axis.userData.originalColor !== undefined) {
               axis.material.color.setHex(axis.userData.originalColor);
          }
     });

     // Highlight hovered axis
     if (intersects.length > 0) {
          const hoveredObject = intersects[0].object;
          if (hoveredObject.material && hoveredObject.userData.hoverColor !== undefined) {
               hoveredObject.material.color.setHex(hoveredObject.userData.hoverColor);
               compassRenderer.domElement.style.cursor = "pointer";
          }
     } else {
          compassRenderer.domElement.style.cursor = "default";
     }
}

function animateCompass() {
     requestAnimationFrame(animateCompass);

     if (compassControls) {
          compassControls.update();
     }

     if (compassRenderer && compassScene && compassCamera) {
          compassRenderer.render(compassScene, compassCamera);
     }
}

function resetCameraView() {
     // Reset to default camera position (positive X-axis view)
     camera.position.set(50, 0, 0);
     camera.lookAt(0, 0, 0);
     controls.target.set(0, 0, 0);
     controls.update();
     console.log("Camera view reset to default (positive X-axis)");
}

function setCameraView(direction) {
     const distance = 50; // Distance from origin to the "limit"
     const target = new THREE.Vector3(0, 0, 0);

     switch (direction) {
          case "posX":
               camera.position.set(distance, 0, 0);
               break;
          case "negX":
               camera.position.set(-distance, 0, 0);
               break;
          case "posY":
               camera.position.set(0, distance, 0);
               break;
          case "negY":
               camera.position.set(0, -distance, 0);
               break;
          case "posZ":
               camera.position.set(0, 0, distance);
               break;
          case "negZ":
               camera.position.set(0, 0, -distance);
               break;
     }

     camera.lookAt(target);
     controls.target.copy(target);
     controls.update();
     console.log(`Camera view set to ${direction} (looking toward origin)`);
}

function generateRandomPoint(face) {
     return new THREE.Vector3(
          Math.random() * (face.x.max - face.x.min) + face.x.min,
          Math.random() * (face.y.max - face.y.min) + face.y.min,
          face.z
     );
}

function generateCranePaths(craneCount) {
     console.log(`Generating ${craneCount} crane paths`);

     // Clear existing data
     pathPairs = [];
     craneData = [];

     // Generate random point pairs
     for (let i = 0; i < craneCount; i++) {
          const startPoint = generateRandomPoint(cubeStartFace);
          const endPoint = generateRandomPoint(cubeEndFace);

          pathPairs.push({
               start: startPoint,
               end: endPoint,
               id: i,
          });
     }

     // Generate curved paths for each pair
     generateCurvedPaths();

     // Create crane data
     for (let i = 0; i < craneCount; i++) {
          const pathPoints = flightPaths[i];
          const initialDirection = new THREE.Vector3().subVectors(pathPoints[1], pathPoints[0]).normalize();

          const craneParams = {
               id: i,
               pathPoints: pathPoints,
               currentPathIndex: 0,
               currentPosition: pathPoints[0].clone(),
               targetPosition: pathPoints[1].clone(),
               referenceVector: initialDirection.clone(),
               derivativeHistory: [],
               isInitialAlignment: true,
               pathProgress: 0, // Progress along current segment (0-1)
          };

          craneData.push(craneParams);
     }
}

function generateCurvedPaths() {
     flightPaths = [];

     for (let i = 0; i < pathPairs.length; i++) {
          const pair = pathPairs[i];
          const curvedPath = createSmoothCurvedPath(pair.start, pair.end);
          flightPaths.push(curvedPath);
     }

     // Path visualization removed - paths are no longer visible
     // visualizeFlightPaths();
}

function createSmoothCurvedPath(startPoint, endPoint) {
     const points = [];

     // Create control points for smooth Bézier-like curve
     const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
     const distance = direction.length();
     direction.normalize();

     // Generate random perpendicular offset for curve variation
     const perpendicular1 = new THREE.Vector3();
     const perpendicular2 = new THREE.Vector3();

     // Create two perpendicular vectors to the main direction
     if (Math.abs(direction.x) < 0.9) {
          perpendicular1.set(1, 0, 0);
     } else {
          perpendicular1.set(0, 1, 0);
     }
     perpendicular1.cross(direction).normalize();
     perpendicular2.crossVectors(direction, perpendicular1).normalize();

     // Random curve parameters for smooth, gradual curves
     const maxCurveOffset = distance * 0.15; // Maximum 15% of total distance for curve offset
     const numControlPoints = 3; // Number of intermediate control points

     // Start point
     points.push(startPoint.clone());

     // Generate intermediate control points with smooth variation
     for (let i = 1; i <= numControlPoints; i++) {
          const t = i / (numControlPoints + 1);

          // Linear interpolation along main direction
          const basePoint = new THREE.Vector3().lerpVectors(startPoint, endPoint, t);

          // Add smooth random offset (using sine waves for smoothness)
          const offsetScale = Math.sin(t * Math.PI) * maxCurveOffset; // Peak offset in middle
          const randomOffset1 = (Math.sin(t * Math.PI * 2 + Math.random() * Math.PI) - 0.5) * offsetScale;
          const randomOffset2 = (Math.cos(t * Math.PI * 2 + Math.random() * Math.PI) - 0.5) * offsetScale;

          basePoint.add(perpendicular1.clone().multiplyScalar(randomOffset1));
          basePoint.add(perpendicular2.clone().multiplyScalar(randomOffset2));

          points.push(basePoint);
     }

     // End point
     points.push(endPoint.clone());

     // Create smooth curve using Catmull-Rom spline
     const curve = new THREE.CatmullRomCurve3(points);
     curve.tension = 0.2; // Lower tension for smoother curves

     // Sample points along the curve
     const curvePoints = curve.getPoints(PATH_RESOLUTION);

     return curvePoints;
}

function updateCranePositionsAndReferences(deltaTime) {
     // Update animation time
     animationTime += deltaTime;

     for (let i = 0; i < craneInstances.length; i++) {
          const craneInstance = craneInstances[i];
          const params = craneData[i];

          if (!craneInstance || !params) continue;

          // Calculate progress along current path segment (speed adjusted by multiplier)
          params.pathProgress += TRAVEL_SPEED * currentSpeedMultiplier * deltaTime;

          // Check if we need to move to next segment or restart
          if (params.pathProgress >= 1.0) {
               params.currentPathIndex++;
               params.pathProgress = 0;

               // Check if we've reached the end of the path
               if (params.currentPathIndex >= params.pathPoints.length - 1) {
                    params.currentPathIndex = 0;
                    params.pathProgress = 0;
                    params.derivativeHistory = [];
                    params.isInitialAlignment = true;

                    // Reset to initial alignment
                    performInitialAlignment(i);
                    continue;
               }

               // Update target position for next segment
               if (params.currentPathIndex < params.pathPoints.length - 1) {
                    params.targetPosition = params.pathPoints[params.currentPathIndex + 1].clone();
               }
          }

          // Interpolate current position along path segment
          if (params.currentPathIndex < params.pathPoints.length - 1) {
               const currentPoint = params.pathPoints[params.currentPathIndex];
               const nextPoint = params.pathPoints[params.currentPathIndex + 1];
               params.currentPosition.lerpVectors(currentPoint, nextPoint, params.pathProgress);
          } else {
               // At the last point
               params.currentPosition.copy(params.pathPoints[params.pathPoints.length - 1]);
          }

          // Update crane object position
          craneInstance.craneObject.position.copy(params.currentPosition);
          craneInstance.objectCenter.copy(params.currentPosition);
          craneInstance.craneObject.updateMatrixWorld(true);

          // Calculate current derivative (direction to next point)
          let currentDerivative = new THREE.Vector3(1, 0, 0); // Default forward

          if (params.currentPathIndex < params.pathPoints.length - 2) {
               // Look ahead a few points for smoother derivative calculation
               const lookAheadIndex = Math.min(params.currentPathIndex + 2, params.pathPoints.length - 1);
               const currentPoint = params.pathPoints[params.currentPathIndex];
               const futurePoint = params.pathPoints[lookAheadIndex];
               currentDerivative = new THREE.Vector3().subVectors(futurePoint, currentPoint).normalize();
          } else if (params.currentPathIndex < params.pathPoints.length - 1) {
               // Near the end, use current to next point
               const currentPoint = params.pathPoints[params.currentPathIndex];
               const nextPoint = params.pathPoints[params.currentPathIndex + 1];
               currentDerivative = new THREE.Vector3().subVectors(nextPoint, currentPoint).normalize();
          }

          // Add to derivative history for smoothing
          params.derivativeHistory.push(currentDerivative.clone());
          if (params.derivativeHistory.length > DERIVATIVE_SMOOTHING_FRAMES) {
               params.derivativeHistory.shift(); // Remove oldest
          }

          // Calculate smoothed reference vector
          if (params.derivativeHistory.length > 0) {
               const smoothedDerivative = new THREE.Vector3();
               for (const derivative of params.derivativeHistory) {
                    smoothedDerivative.add(derivative);
               }
               smoothedDerivative.divideScalar(params.derivativeHistory.length);
               smoothedDerivative.normalize();

               params.referenceVector.copy(smoothedDerivative);
          }

          // Check if it's time for re-alignment (every 0.1 seconds)
          if (
               animationTime - lastRealignmentTime >= REALIGNMENT_INTERVAL &&
               !params.isInitialAlignment &&
               !craneInstance.isAnimating
          ) {
               performPeriodicAlignment(i);
          }
     }

     // Update last realignment time for all cranes
     if (animationTime - lastRealignmentTime >= REALIGNMENT_INTERVAL) {
          lastRealignmentTime = animationTime;
     }
}

function loadCraneModels() {
     const loader = new OBJLoader();

     console.log("Loading crane models...");

     loader.load(
          "assets/crane-3D.obj",
          async function (object) {
               console.log("Crane model loaded successfully");

               // Create crane group
               craneGroup = new CraneGroup("test-group-p8");

               // Set all cranes to white color
               craneGroup.setAllCranesWhite(true);

               // Create crane instances
               for (let i = 0; i < currentCraneCount; i++) {
                    const params = craneData[i];

                    // Create crane instance
                    const craneInstance = new CraneInstance(`test-crane-p8-${i}`);

                    // Set crane position
                    craneInstance.setPosition(
                         params.currentPosition.x,
                         params.currentPosition.y,
                         params.currentPosition.z
                    );

                    // Clone the OBJ object for this crane
                    const craneObject = object.clone();
                    craneInstance.loadFromOBJObject(craneObject);

                    // Add crane to group
                    craneGroup.addCrane(craneInstance);

                    // Process the crane geometry with white color and wireframe (use scale=1.0 to avoid double scaling)
                    CraneUtilities.processCraneInstance(craneInstance, 1.0, 0xffffff, 2);

                    // Apply our own scaling after processing (this is the only place scale is applied)
                    craneInstance.craneObject.scale.setScalar(currentCraneScale * currentScaleMultiplier);
                    craneInstance.craneObject.updateMatrixWorld(true);

                    // Apply shaders to enable wing flapping
                    craneGroup.applyShadersToTarget(craneInstance, 0xffffff);

                    // Add crane to scene
                    scene.add(craneInstance.craneObject);

                    // Start wing flapping animation
                    craneInstance.startWingFlap();

                    // Add to instances array
                    craneInstances.push(craneInstance);

                    // Perform initial alignment
                    performInitialAlignment(i);
               }

               // Update UI
               const loadingDiv = document.getElementById("loading");
               if (loadingDiv) loadingDiv.classList.add("hidden");

               // Show view controls
               const viewControlsDiv = document.getElementById("viewControls");
               if (viewControlsDiv) viewControlsDiv.style.display = "block";

               console.log("All origami cranes loaded and initialized!");
          },
          function (progress) {
               console.log("Loading progress:", progress);
          },
          function (error) {
               console.error("Error loading crane model:", error);
          }
     );
}

function performInitialAlignment(craneIndex) {
     const craneInstance = craneInstances[craneIndex];
     const params = craneData[craneIndex];

     if (!craneInstance || !params) return;

     // Step 1: Align to positive X-axis first
     const positiveXVector = new THREE.Vector3(1, 0, 0);
     craneInstance.updateReferenceVectorWithUpRotation(positiveXVector, QuaternionTransforms);

     // Step 2: Align to initial reference vector using smooth update
     craneInstance.updateReferenceVectorSmooth(params.referenceVector, MAX_ANGLE_CHANGE, QuaternionTransforms);

     // Perform initial crane analysis and alignment using class methods
     craneInstance.performCraneAnalysis();
     craneInstance.performAlignmentTestFlight(QuaternionTransforms, params.referenceVector);

     params.isInitialAlignment = false;
}

function performPeriodicAlignment(craneIndex) {
     const craneInstance = craneInstances[craneIndex];
     const params = craneData[craneIndex];

     if (!craneInstance || !params || craneInstance.isAnimating) return;

     // Update the crane's reference vector using smooth transitions
     craneInstance.updateReferenceVectorSmooth(params.referenceVector, MAX_ANGLE_CHANGE, QuaternionTransforms);

     // Perform crane analysis and alignment using class methods
     craneInstance.performCraneAnalysis();
     craneInstance.performAlignmentTestFlight(QuaternionTransforms, params.referenceVector);
}

function regenerateCranes() {
     console.log(`Regenerating cranes with count: ${currentCraneCount}`);

     // Show loading screen
     const loadingDiv = document.getElementById("loading");
     if (loadingDiv) loadingDiv.classList.remove("hidden");

     // Clear existing cranes
     craneInstances.forEach((craneInstance) => {
          if (craneInstance && craneInstance.craneObject) {
               scene.remove(craneInstance.craneObject);
          }
     });
     craneInstances = [];

     // Clear crane group
     craneGroup = null;

     // Reset animation time
     animationTime = 0;
     lastRealignmentTime = 0;

     // Generate new paths
     generateCranePaths(currentCraneCount);

     // Load crane models with new count
     loadCraneModels();
}

function updateCraneScales() {
     if (!craneGroup || craneInstances.length === 0) return;

     // Update scale for all existing cranes
     craneInstances.forEach((craneInstance) => {
          if (craneInstance && craneInstance.craneObject) {
               // Apply consistent scaling: base scale × scale multiplier
               craneInstance.craneObject.scale.setScalar(currentCraneScale * currentScaleMultiplier);
               craneInstance.craneObject.updateMatrixWorld(true);

               // Update object center after scaling
               craneInstance.updateObjectCenter();
          }
     });

     console.log(
          `Updated crane scales to ${(currentCraneScale * currentScaleMultiplier).toFixed(4)}x (base: ${currentCraneScale}, multiplier: ${currentScaleMultiplier}) for ${craneInstances.length} cranes`
     );
}

function onWindowResize() {
     camera.aspect = window.innerWidth / window.innerHeight;
     camera.updateProjectionMatrix();
     renderer.setSize(window.innerWidth, window.innerHeight);

     // Recalculate viewing dimensions
     calculateViewingDimensions();
}

// Animation timing
let lastFrameTime = 0;

function animate(currentTime = 0) {
     requestAnimationFrame(animate);

     // Calculate delta time in seconds
     const deltaTime = lastFrameTime ? (currentTime - lastFrameTime) / 1000 : 0;
     lastFrameTime = currentTime;

     // Update controls
     controls.update();

     // Update crane positions and reference vectors
     if (craneInstances.length > 0 && deltaTime > 0) {
          updateCranePositionsAndReferences(deltaTime);
     }

     // Update crane animations
     craneInstances.forEach((craneInstance) => {
          if (craneInstance && craneInstance.updateAnimation) {
               const finalWingSpeed = BASE_WING_FLAP_SPEED * currentWingSpeedMultiplier;
               craneInstance.updateAnimation(finalWingSpeed, true);
          }
     });

     // Render the scene
     renderer.render(scene, camera);
}

// Cleanup function
function cleanup() {
     // Clean up path lines
     pathLines.forEach((line) => {
          if (line) {
               line.geometry.dispose();
               line.material.dispose();
               scene.remove(line);
          }
     });

     // Clean up crane instances
     craneInstances.forEach((craneInstance) => {
          if (craneInstance && craneInstance.craneObject) {
               scene.remove(craneInstance.craneObject);
          }
     });

     // Clean up compass resources
     if (compassRenderer) {
          compassRenderer.dispose();
     }
     if (compassScene) {
          compassScene.clear();
     }
}

// Handle page unload
window.addEventListener("beforeunload", cleanup);

// Make compass functions globally available for HTML onclick attributes
window.resetCameraView = resetCameraView;
window.setCameraView = setCameraView;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initOrigamiTestFlight);

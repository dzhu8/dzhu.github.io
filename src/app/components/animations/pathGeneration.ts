import * as THREE from "three";

export interface PathGenerationConfig {
     cameraDistance: number;
     craneCount: number;
}

export interface PathData {
     pathPoints: THREE.Vector3[];
     currentPathIndex: number;
     pathProgress: number;
     currentPosition: THREE.Vector3;
     referenceVector: THREE.Vector3;
     derivativeHistory: THREE.Vector3[];
     isInitialAlignment: boolean;
}

export interface PathGenerationResult {
     paths: THREE.Vector3[][];
     pathData: PathData[];
     zCoordinates: { startZ: number[]; endZ: number[] };
}

export class PathGenerator {
     private viewDepth!: number;
     private viewHeight!: number;
     private frontZ!: number;
     private backZ!: number;
     private perspectiveCompensation!: number;
     private frontWidth!: number;
     private backWidth!: number;
     private frontYLimit!: number;
     private backYLimit!: number;

     constructor(config: PathGenerationConfig) {
          this.calculateViewingDimensions(config.cameraDistance);
     }

     private calculateViewingDimensions(cameraDistance: number): void {
          // Define trapezoidal viewing dimensions to combat perspective distortion
          this.viewDepth = cameraDistance * 0.4; // Depth of the viewing volume
          this.viewHeight = cameraDistance * 1.2;

          // Create trapezoidal container: front face narrower, back face wider
          // This compensates for perspective projection making distant objects appear smaller
          this.frontZ = 2.5 - this.viewDepth * 0.5; // Front of the viewing volume
          this.backZ = 2.5 + this.viewDepth * 0.5; // Back of the viewing volume

          // Calculate perspective compensation factor
          // Objects at backZ appear smaller by factor of frontZ/backZ, so we scale them up
          this.perspectiveCompensation = (cameraDistance - this.frontZ) / (cameraDistance - this.backZ);

          // Front and back face widths
          this.frontWidth = cameraDistance * 2;
          this.backWidth = this.frontWidth * this.perspectiveCompensation; // Wider back face

          // Y-axis limits as a fraction of the view area (same for front and back)
          const Y_LIMIT_FACTOR = 0.9; // Use 90% of the available height
          this.frontYLimit = this.viewHeight * Y_LIMIT_FACTOR * 0.5;
          this.backYLimit = this.frontYLimit * this.perspectiveCompensation; // Taller back face
     }

     private generateRandomPoint(isStart: boolean): THREE.Vector3 {
          if (isStart) {
               // Start points on the left side (front face)
               const yRange = this.frontYLimit * 2;
               const yOffset = -this.frontYLimit + Math.random() * yRange;
               const zOffset = this.frontZ + Math.random() * this.viewDepth;

               // Interpolate width based on z-position within the viewing volume
               const zProgress = (zOffset - this.frontZ) / this.viewDepth;
               const currentWidth = this.frontWidth + (this.backWidth - this.frontWidth) * zProgress;
               const currentYLimit = this.frontYLimit + (this.backYLimit - this.frontYLimit) * zProgress;

               return new THREE.Vector3(
                    -currentWidth * 0.8,
                    Math.max(-currentYLimit, Math.min(currentYLimit, yOffset)),
                    zOffset
               );
          } else {
               // End points on the right side (back face)
               const yRange = this.backYLimit * 2;
               const yOffset = -this.backYLimit + Math.random() * yRange;
               const zOffset = this.frontZ + Math.random() * this.viewDepth;

               // Interpolate width based on z-position within the viewing volume
               const zProgress = (zOffset - this.frontZ) / this.viewDepth;
               const currentWidth = this.frontWidth + (this.backWidth - this.frontWidth) * zProgress;
               const currentYLimit = this.frontYLimit + (this.backYLimit - this.frontYLimit) * zProgress;

               return new THREE.Vector3(
                    currentWidth * 0.8,
                    Math.max(-currentYLimit, Math.min(currentYLimit, yOffset)),
                    zOffset
               );
          }
     }

     private createSmoothCurvedPath(
          startPoint: THREE.Vector3,
          endPoint: THREE.Vector3,
          pathIndex: number
     ): THREE.Vector3[] {
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
          const maxZOffset = this.viewDepth * 0.15; // Much smaller z-axis variation
          const numControlPoints = 3;

          // Determine curve direction: even indices go up, odd indices go down
          const curveDirection = pathIndex % 2 === 0 ? 1 : -1; // +1 for concave up, -1 for concave down

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
               const randomOffsetY =
                    (Math.sin(t * Math.PI * 2 + Math.random() * Math.PI) - 0.5) * offsetScale * curveDirection;
               const randomOffsetZ = (Math.cos(t * Math.PI * 2 + Math.random() * Math.PI) - 0.5) * zOffsetScale;

               basePoint.add(new THREE.Vector3(0, randomOffsetY, randomOffsetZ));

               // Calculate y-limit for this z-position in the trapezoidal volume
               const zProgress = (basePoint.z - this.frontZ) / this.viewDepth;
               const currentYLimit = this.frontYLimit + (this.backYLimit - this.frontYLimit) * zProgress;

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
          curvePoints.forEach((point) => {
               const zProgress = (point.z - this.frontZ) / this.viewDepth;
               const currentYLimit = this.frontYLimit + (this.backYLimit - this.frontYLimit) * zProgress;
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
                    const smoothedY = current.y * (1 - smoothingWeight) + (prev.y + next.y) * 0.5 * smoothingWeight;

                    // Calculate y-limit for this z-position and apply smoothed Y but keep it within limits
                    const zProgress = (current.z - this.frontZ) / this.viewDepth;
                    const currentYLimit = this.frontYLimit + (this.backYLimit - this.frontYLimit) * zProgress;
                    smoothedPoints[i].y = Math.max(-currentYLimit, Math.min(currentYLimit, smoothedY));
               }
          }

          return smoothedPoints;
     }

     public generateCranePaths(craneCount: number): PathGenerationResult {
          const paths: THREE.Vector3[][] = [];
          const pathData: PathData[] = [];

          // Initialize z-coordinate storage
          const startZCoords: number[] = [];
          const endZCoords: number[] = [];

          for (let i = 0; i < craneCount; i++) {
               const startPoint = this.generateRandomPoint(true);
               const endPoint = this.generateRandomPoint(false);
               const pathPoints = this.createSmoothCurvedPath(startPoint, endPoint, i);

               // Store z-coordinates
               startZCoords.push(Number(startPoint.z.toFixed(2)));
               endZCoords.push(Number(endPoint.z.toFixed(2)));

               // Calculate initial direction vector for alignment
               const initialDirection = new THREE.Vector3().subVectors(pathPoints[1], pathPoints[0]).normalize();

               paths.push(pathPoints);
               pathData.push({
                    pathPoints,
                    currentPathIndex: 0,
                    pathProgress: Math.random(), // Random starting progress for variety
                    currentPosition: pathPoints[0].clone(),
                    referenceVector: initialDirection.clone(),
                    derivativeHistory: [],
                    isInitialAlignment: true,
               });
          }

          return {
               paths,
               pathData,
               zCoordinates: { startZ: startZCoords, endZ: endZCoords },
          };
     }

     public static visualizePaths(scene: THREE.Scene, paths: THREE.Vector3[][], pathLines: THREE.Line[]): THREE.Line[] {
          // Clear existing path lines
          pathLines.forEach((line) => {
               scene.remove(line);
          });
          const newPathLines: THREE.Line[] = [];

          // Create new path lines
          paths.forEach((path) => {
               const geometry = new THREE.BufferGeometry().setFromPoints(path);
               const material = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
               const line = new THREE.Line(geometry, material);

               scene.add(line);
               newPathLines.push(line);
          });

          return newPathLines;
     }
}

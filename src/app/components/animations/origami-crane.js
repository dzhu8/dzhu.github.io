// Import Three.js modules
import * as THREE from "three";

// Wing flapping animation constants
const WING_FLAP_ANGLE = 0.7; // Maximum rotation angle in radians

// Visual appearance constants
const DEFAULT_WIREFRAME_WIDTH = 2; // Default wireframe line width
const DEFAULT_CRANE_TRANSPARENCY = 1.0; // Default crane alpha value (0.0 = transparent, 1.0 = opaque)

// Crane class to encapsulate individual crane data and behavior
export class CraneInstance {
     constructor(id) {
          this.id = id;
          this.craneObject = null;
          this.faces = [];
          this.edges = [];
          this.meshGroups = [];
          this.objectCenter = new THREE.Vector3(); // Center of this crane object
          this.initialScale = null; // Store the initial scale for relative scaling

          // Color assignment from parent group
          this.assignedColor = null; // Color assigned by the parent CraneGroup

          // Lighting uniforms for shader integration
          this.lightingUniforms = {
               ambientLightIntensity: { value: 0.95 },
               ambientLightColor: { value: new THREE.Color(0xffffff) },
               directionalLightIntensity: { value: 1.0 },
               directionalLightColor: { value: new THREE.Color(0xffffff) },
               directionalLightDirection: { value: new THREE.Vector3(-1, -1, -1).normalize() },
               useExternalLighting: { value: true },
          };

          // Position management
          this.position = new THREE.Vector3(0, 0, 0); // World position of the crane
          this.targetPosition = new THREE.Vector3(0, 0, 0); // Target position to move towards

          // Direction tracking
          this.face2Centroid = null;
          this.face5Centroid = null;
          this.trackingVector = new THREE.Vector3(1, 0, 0); // Computed tracking vector
          this.currentDirection = new THREE.Vector3(1, 0, 0);
          this.directionMatrixUniforms = []; // Store references to direction matrix uniforms

          // Vector alignment system
          this.alignmentVector = new THREE.Vector3(1, 0, 0); // Vector from centroid to projection point
          this.referenceVector = new THREE.Vector3(1, 0, 0); // Target reference vector to align with
          this.previousReferenceVector = new THREE.Vector3(1, 0, 0); // Previous reference vector for constraint checking
          this.upVector = new THREE.Vector3(0, 1, 0); // Up vector initially pointing in positive Y direction
          this.projectionPoint = new THREE.Vector3(); // Calculated projection point for alignment
          this.originalQuaternion = null; // Store original orientation
          this.isAligned = false; // Track alignment state

          // Visualization arrows for alignment
          this.alignmentVectorArrow = null; // Yellow arrow showing alignment vector
          this.referenceVectorArrow = null; // Orange arrow showing reference vector
          this.upVectorArrow = null; // Green arrow showing up vector

          // Basic state tracking (no quaternion rotation methods)
          this.isVisible = true; // Track visibility state
          this.isAnimating = false; // Track animation state for alignment operations
          this.frameCount = 0; // Track animation frames

          // Tracking vector visualization
          this.trackingVectorArrow = null; // Arrow to visualize the tracking vector

          // Animation sets for this crane instance
          this.animationSet1 = {
               selectedFaceIndices: [23, 24, 25, 26, 27, 28, 29, 86, 87, 102, 103],
               hingeEdgeIndex: 80,
               hingeEdgeData: null,
               isAnimationActive: false,
               animationUniforms: null,
          };

          this.animationSet2 = {
               selectedFaceIndices: [8, 10, 9, 11, 12, 13, 14, 70, 71, 88, 89],
               hingeEdgeIndex: 35,
               hingeEdgeData: null,
               isAnimationActive: false,
               animationUniforms: null,
          };

          this.initializeAnimationUniforms();
     }

     initializeAnimationUniforms() {
          this.animationSet1.animationUniforms = {
               time: { value: 0.0 },
               animationPhase: { value: 0.0 },
               rotationAngle: { value: WING_FLAP_ANGLE },
               isAnimating: { value: false },
          };

          this.animationSet2.animationUniforms = {
               time: { value: 0.0 },
               animationPhase: { value: 0.0 },
               rotationAngle: { value: WING_FLAP_ANGLE },
               isAnimating: { value: false },
          };
     }

     startWingFlap() {
          this.animationSet1.isAnimationActive = true;
          this.animationSet2.isAnimationActive = true;

          if (this.animationSet1.animationUniforms) {
               this.animationSet1.animationUniforms.isAnimating.value = true;
          }
          if (this.animationSet2.animationUniforms) {
               this.animationSet2.animationUniforms.isAnimating.value = true;
          }
     }

     stopWingFlap() {
          this.animationSet1.isAnimationActive = false;
          this.animationSet2.isAnimationActive = false;

          if (this.animationSet1.animationUniforms) {
               this.animationSet1.animationUniforms.isAnimating.value = false;
          }
          if (this.animationSet2.animationUniforms) {
               this.animationSet2.animationUniforms.isAnimating.value = false;
          }
     }

     updateAnimation(wingFlapSpeed = 7.5, wingFlapEnabled = true) {
          const deltaTime = 0.016; // Approximately 60 FPS

          // Increment frame counter
          this.frameCount++;

          // Update wing flap animations
          [this.animationSet1, this.animationSet2].forEach((animationSet) => {
               if (animationSet.animationUniforms) {
                    if (animationSet.animationUniforms.isAnimating.value) {
                         animationSet.animationUniforms.time.value += deltaTime * wingFlapSpeed;
                         animationSet.animationUniforms.animationPhase.value = Math.sin(
                              animationSet.animationUniforms.time.value * 2.0
                         );
                    } else {
                         animationSet.animationUniforms.time.value = 0.0;
                    }
               }
          });

          // Auto-start wing flapping when crane becomes visible
          if (this.isVisible && wingFlapEnabled && !this.animationSet1.isAnimationActive) {
               this.startWingFlap();
          }

          // Stop wing flapping when globally disabled
          if (!wingFlapEnabled && this.animationSet1.isAnimationActive) {
               this.stopWingFlap();
          }
     }

     // Method to get shader uniforms for external access
     getShaderUniforms() {
          return {
               set1: this.animationSet1.animationUniforms,
               set2: this.animationSet2.animationUniforms,
               lighting: this.lightingUniforms,
          };
     }

     // Lighting control methods
     setAmbientLightIntensity(intensity) {
          this.lightingUniforms.ambientLightIntensity.value = Math.max(0, Math.min(1, intensity));
          this.updateMaterialLighting();
     }

     setAmbientLightColor(color) {
          this.lightingUniforms.ambientLightColor.value.setHex(color);
          this.updateMaterialLighting();
     }

     setDirectionalLightIntensity(intensity) {
          this.lightingUniforms.directionalLightIntensity.value = Math.max(0, Math.min(2, intensity));
          this.updateMaterialLighting();
     }

     setDirectionalLightColor(color) {
          this.lightingUniforms.directionalLightColor.value.setHex(color);
          this.updateMaterialLighting();
     }

     setDirectionalLightDirection(direction) {
          this.lightingUniforms.directionalLightDirection.value.copy(direction.normalize());
          this.updateMaterialLighting();
     }

     setUseExternalLighting(useExternal) {
          this.lightingUniforms.useExternalLighting.value = useExternal;
          this.updateMaterialLighting();
     }

     // Update material lighting uniforms
     updateMaterialLighting() {
          this.meshGroups.forEach((group) => {
               const solidMesh = group.userData.solidMesh;
               if (solidMesh.material && solidMesh.material.uniforms) {
                    // Update lighting uniforms
                    Object.keys(this.lightingUniforms).forEach((key) => {
                         if (solidMesh.material.uniforms[key]) {
                              solidMesh.material.uniforms[key].value = this.lightingUniforms[key].value;
                         }
                    });
               }
          });
     }

     // Update lighting from external Three.js lights
     updateFromSceneLights(lights) {
          if (!lights) return;

          // Update from ambient light
          if (lights.ambient) {
               this.lightingUniforms.ambientLightColor.value.copy(lights.ambient.color);
               this.lightingUniforms.ambientLightIntensity.value = lights.ambient.intensity;
          }

          // Update from directional light
          if (lights.directional) {
               this.lightingUniforms.directionalLightColor.value.copy(lights.directional.color);
               this.lightingUniforms.directionalLightIntensity.value = lights.directional.intensity;

               // Calculate light direction (from light position to origin)
               const lightDirection = lights.directional.position.clone().normalize().negate();
               this.lightingUniforms.directionalLightDirection.value.copy(lightDirection);
          }

          this.updateMaterialLighting();
     }

     // Position management methods
     setPosition(x, y, z) {
          if (x instanceof THREE.Vector3) {
               this.position.copy(x);
          } else {
               this.position.set(x, y, z);
          }

          if (this.craneObject) {
               this.craneObject.position.copy(this.position);
               this.craneObject.updateMatrixWorld(true);
               this.updateObjectCenter();
          }
     }

     getPosition() {
          return this.position.clone();
     }

     setTargetPosition(x, y, z) {
          if (x instanceof THREE.Vector3) {
               this.targetPosition.copy(x);
          } else {
               this.targetPosition.set(x, y, z);
          }
     }

     // Move crane to target position immediately
     moveToTargetPosition() {
          this.setPosition(this.targetPosition);
     }

     // Update object center after position/transformation changes
     updateObjectCenter() {
          if (this.craneObject) {
               const box = new THREE.Box3().setFromObject(this.craneObject);
               this.objectCenter.copy(box.getCenter(new THREE.Vector3()));
          }
     }

     // Vector alignment methods
     setReferenceVector(vector) {
          // Store the current reference vector as the previous one
          this.previousReferenceVector.copy(this.referenceVector);

          // Set the new reference vector
          this.referenceVector.copy(vector.clone().normalize());
     }

     getReferenceVector() {
          return this.referenceVector.clone();
     }

     // Get previous reference vector
     getPreviousReferenceVector() {
          return this.previousReferenceVector.clone();
     }

     // Check if the angle change between current and previous reference vectors exceeds 90 degrees
     isReferenceVectorChangeExcessive() {
          // Calculate the angle between current and previous reference vectors
          const dotProduct = this.referenceVector.dot(this.previousReferenceVector);
          const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
          const angleDegrees = THREE.MathUtils.radToDeg(angle);

          const maxAllowedChange = 90; // degrees
          const isExcessive = angleDegrees > maxAllowedChange;

          return isExcessive;
     }

     // Up vector methods
     setUpVector(vector) {
          this.upVector.copy(vector.clone().normalize());
     }

     getUpVector() {
          return this.upVector.clone();
     }

     // Reset up vector to initial state (positive Y direction)
     resetUpVector() {
          this.upVector.set(0, 1, 0);
     }

     // Update reference vector and apply the same rotation to the up vector
     updateReferenceVectorWithUpRotation(newReferenceVector, QuaternionTransforms) {
          // Store the old reference vector (this will become the previous one)
          const oldReferenceVector = this.referenceVector.clone();

          // Set the new reference vector (this will automatically update previousReferenceVector)
          this.setReferenceVector(newReferenceVector);

          // Calculate the quaternion that rotates from old to new reference vector
          const rotationResult = QuaternionTransforms.calculateVectorAlignmentQuaternion(
               oldReferenceVector,
               this.referenceVector.clone(),
               new THREE.Vector3(0, 1, 0) // Up vector for roll control
          );

          // Apply the same rotation to the up vector
          this.upVector.applyQuaternion(rotationResult.quaternion);

          return {
               oldReferenceVector: oldReferenceVector,
               newReferenceVector: this.referenceVector.clone(),
               rotationQuaternion: rotationResult.quaternion.clone(),
               updatedUpVector: this.upVector.clone(),
               rotationAngle: THREE.MathUtils.radToDeg(rotationResult.angle),
          };
     }

     // Smooth reference vector update with maximum angle change constraint
     updateReferenceVectorSmooth(newReferenceVector, maxAngleChange = 45, QuaternionTransforms) {
          const targetVector = newReferenceVector.clone().normalize();

          // Calculate angle between current and target
          const dotProduct = this.referenceVector.dot(targetVector);
          const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
          const angleDegrees = THREE.MathUtils.radToDeg(angle);

          if (angleDegrees <= maxAngleChange) {
               return this.updateReferenceVectorWithUpRotation(targetVector, QuaternionTransforms);
          } else {
               // Large change - interpolate towards target
               const t = maxAngleChange / angleDegrees; // Interpolation factor
               const interpolatedVector = new THREE.Vector3();
               interpolatedVector.lerpVectors(this.referenceVector, targetVector, t);
               interpolatedVector.normalize();

               return this.updateReferenceVectorWithUpRotation(interpolatedVector, QuaternionTransforms);
          }
     }

     // Calculate the alignment vector (from centroid to projection point)
     calculateAlignmentVector() {
          if (!this.projectionPoint || !this.objectCenter) {
               return this.alignmentVector;
          }

          this.alignmentVector.subVectors(this.projectionPoint, this.objectCenter);

          if (this.alignmentVector.length() > 0) {
               this.alignmentVector.normalize();
          } else {
               this.alignmentVector.set(1, 0, 0);
          }

          return this.alignmentVector;
     }

     // Calculate projection point for alignment
     calculateProjectionPoint() {
          if (!this.face2Centroid || !this.face5Centroid) {
               return;
          }

          // Calculate midpoint between face 2 and face 5 centroids
          const midpoint = new THREE.Vector3().addVectors(this.face2Centroid, this.face5Centroid).multiplyScalar(0.5);

          // Transform midpoint to world space if needed
          if (this.craneObject) {
               midpoint.applyMatrix4(this.craneObject.matrixWorld);
          }

          // Get tracking vector in world space
          const worldTrackingVector = this.getWorldTrackingVector();

          // Project midpoint onto line through object center parallel to tracking vector
          const centroidToMidpoint = new THREE.Vector3().subVectors(midpoint, this.objectCenter);
          let projectionLength = centroidToMidpoint.dot(worldTrackingVector);
          // Handle the case where tracking vector points opposite to the desired direction
          if (projectionLength < 0) {
               console.warn(`Projection length for crane ${craneIndex} is negative, using the absolute value`);
               projectionLength = Math.abs(projectionLength);
          }
          this.projectionPoint
               .copy(this.objectCenter)
               .add(worldTrackingVector.clone().multiplyScalar(projectionLength));

          return this.projectionPoint;
     }

     // Perform alignment to reference vector using quaternion transforms
     performAlignment(QuaternionTransforms) {
          if (!this.referenceVector || !this.projectionPoint) {
               console.warn("Cannot perform alignment: missing reference vector or projection point");
               return false;
          }

          // Check if the reference vector change is excessive (>90 degrees)
          if (this.isReferenceVectorChangeExcessive()) {
               console.warn("Alignment aborted: Reference vector angle change exceeds 90 degrees");
               return false;
          }

          // Store original orientation if not already stored
          if (!this.originalQuaternion) {
               this.originalQuaternion = this.craneObject.quaternion.clone();
          }

          // Calculate current alignment vector
          this.calculateAlignmentVector();

          // Calculate centroid in local space for rotation point
          const craneObjectMatrix = this.craneObject.matrixWorld.clone();
          const craneObjectMatrixInverse = craneObjectMatrix.clone().invert();
          const centroidInLocalSpace = this.objectCenter.clone();
          centroidInLocalSpace.applyMatrix4(craneObjectMatrixInverse);

          // Calculate alignment quaternion
          const alignmentResult = QuaternionTransforms.calculateVectorAlignmentQuaternion(
               this.alignmentVector.clone(),
               this.referenceVector.clone(),
               new THREE.Vector3(0, 1, 0) // Up vector for roll control
          );

          // Apply rotation around centroid
          QuaternionTransforms.applyRotationAroundPoint(
               this.craneObject,
               alignmentResult.quaternion,
               centroidInLocalSpace,
               true // Apply relative to current rotation
          );

          // Apply the same quaternion rotation to the up vector
          this.upVector.applyQuaternion(alignmentResult.quaternion);

          this.craneObject.updateMatrixWorld(true);
          this.isAligned = true;

          // Update object center after transformation
          this.updateObjectCenter();

          // Recalculate projection point and alignment vector after transformation
          setTimeout(() => {
               this.recalculateAfterAlignment();
               this.verifyAlignment();
          }, 50);

          return true;
     }

     // Recalculate alignment data after transformation
     recalculateAfterAlignment() {
          // Update face centroids to world space
          if (this.face2Centroid && this.face5Centroid) {
               const face2WorldCentroid = this.face2Centroid.clone();
               face2WorldCentroid.applyMatrix4(this.craneObject.matrixWorld);

               const face5WorldCentroid = this.face5Centroid.clone();
               face5WorldCentroid.applyMatrix4(this.craneObject.matrixWorld);

               // Recalculate midpoint in world space
               const midpointWorld = new THREE.Vector3()
                    .addVectors(face2WorldCentroid, face5WorldCentroid)
                    .multiplyScalar(0.5);

               // Get world tracking vector
               const worldTrackingVector = this.getWorldTrackingVector();

               // Recalculate projection point
               const centroidToMidpoint = new THREE.Vector3().subVectors(midpointWorld, this.objectCenter);
               const projectionLength = centroidToMidpoint.dot(worldTrackingVector);
               this.projectionPoint
                    .copy(this.objectCenter)
                    .add(worldTrackingVector.clone().multiplyScalar(projectionLength));

               // Recalculate alignment vector
               this.calculateAlignmentVector();
          }
     }

     // Verify alignment accuracy
     verifyAlignment() {
          if (!this.referenceVector || !this.alignmentVector) {
               return false;
          }

          const dotProduct = this.alignmentVector.dot(this.referenceVector);
          const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
          const angleDegrees = THREE.MathUtils.radToDeg(angle);

          const tolerance = 0.5; // degrees
          const isVectorAligned = angleDegrees < tolerance;

          return isVectorAligned;
     }

     // Perform crane analysis
     performCraneAnalysis() {
          // Get the coordinates of the crane centroid
          const craneCentroid = this.objectCenter.clone();

          // Determine the centroids of faces 2 and 5 in world space
          let face2CentroidWorld = null;
          let face5CentroidWorld = null;

          if (this.face2Centroid && this.face5Centroid) {
               face2CentroidWorld = this.face2Centroid.clone();
               face2CentroidWorld.applyMatrix4(this.craneObject.matrixWorld);

               face5CentroidWorld = this.face5Centroid.clone();
               face5CentroidWorld.applyMatrix4(this.craneObject.matrixWorld);
          }

          if (!face2CentroidWorld || !face5CentroidWorld) {
               console.error(`Face centroids not available for crane ${this.id}`);
               return false;
          }

          // Determine the midpoint of the two centroids
          const midpoint = new THREE.Vector3().addVectors(face2CentroidWorld, face5CentroidWorld).multiplyScalar(0.5);

          // Get the crane's tracking vector in world space
          const trackingVector = this.trackingVector.clone().normalize();
          trackingVector.transformDirection(this.craneObject.matrixWorld);

          // Project the midpoint to the line through centroid parallel to tracking vector
          const centroidToMidpoint = new THREE.Vector3().subVectors(midpoint, craneCentroid);
          let projectionLength = centroidToMidpoint.dot(trackingVector);

          // Handle the case where tracking vector points opposite to the desired direction
          if (projectionLength < 0) {
               projectionLength = Math.abs(projectionLength);
          }

          this.projectionPoint = craneCentroid.clone().add(trackingVector.clone().multiplyScalar(projectionLength));
          return true;
     }

     // Recalculate projection point after alignment
     recalculateProjectionPointAfterAlignment() {
          if (!this.craneObject) {
               console.error(`Cannot recalculate projection point: crane instance ${this.id} not available`);
               return false;
          }

          // Force update of the crane's matrices and geometry
          this.craneObject.updateMatrixWorld(true);

          // Get updated crane data after transformation
          const craneCentroid = this.objectCenter.clone();

          // Transform face centroids to world space
          let face2CentroidWorld = null;
          let face5CentroidWorld = null;

          if (this.face2Centroid && this.face5Centroid) {
               face2CentroidWorld = this.face2Centroid.clone();
               face2CentroidWorld.applyMatrix4(this.craneObject.matrixWorld);

               face5CentroidWorld = this.face5Centroid.clone();
               face5CentroidWorld.applyMatrix4(this.craneObject.matrixWorld);
          }

          if (!face2CentroidWorld || !face5CentroidWorld) {
               console.error(`Face centroids not available for recalculation for crane ${this.id}`);
               return false;
          }

          // Recalculate midpoint
          const midpointWorld = new THREE.Vector3()
               .addVectors(face2CentroidWorld, face5CentroidWorld)
               .multiplyScalar(0.5);

          // Transform tracking vector to world space
          const trackingVectorWorld = this.trackingVector.clone().normalize();
          trackingVectorWorld.transformDirection(this.craneObject.matrixWorld);

          // Recalculate projection point
          const centroidToMidpoint = new THREE.Vector3().subVectors(midpointWorld, craneCentroid);
          let projectionLength = centroidToMidpoint.dot(trackingVectorWorld);

          // Handle the case where tracking vector points opposite to the desired direction
          if (projectionLength < 0) {
               projectionLength = Math.abs(projectionLength);
          }

          this.projectionPoint = craneCentroid
               .clone()
               .add(trackingVectorWorld.clone().multiplyScalar(projectionLength));

          return true;
     }

     // Perform alignment using test-flight implementation approach
     performAlignmentTestFlight(QuaternionTransforms, referenceVector) {
          if (!this.craneObject || !this.projectionPoint || this.isAnimating) {
               return false;
          }

          // Set the reference vector if provided
          if (referenceVector) {
               this.setReferenceVector(referenceVector);
          }

          this.isAnimating = true;

          // Store original orientation if not already stored
          if (!this.originalQuaternion) {
               this.originalQuaternion = this.craneObject.quaternion.clone();
          }

          // Get the vector from crane centroid to the projection point
          const craneCentroid = this.objectCenter.clone();
          const centroidToProjection = new THREE.Vector3().subVectors(this.projectionPoint, craneCentroid);
          centroidToProjection.normalize();

          // Calculate the centroid position in local space
          const craneObjectMatrix = this.craneObject.matrixWorld.clone();
          const craneObjectMatrixInverse = craneObjectMatrix.clone().invert();
          const centroidInLocalSpace = craneCentroid.clone();
          centroidInLocalSpace.applyMatrix4(craneObjectMatrixInverse);

          // Calculate the alignment quaternion
          const alignmentResult = QuaternionTransforms.calculateVectorAlignmentQuaternion(
               centroidToProjection.clone(),
               this.referenceVector.clone(),
               new THREE.Vector3(0, 1, 0) // Up vector for roll control
          );

          // Apply the alignment transformation
          QuaternionTransforms.applyRotationAroundPoint(
               this.craneObject,
               alignmentResult.quaternion,
               centroidInLocalSpace,
               true
          );

          this.craneObject.updateMatrixWorld(true);

          // Use a small delay to ensure transformation is complete
          setTimeout(() => {
               this.recalculateProjectionPointAfterAlignment();
               this.verifyAlignmentTestFlight();
               this.isAnimating = false;
          }, 50);

          return true;
     }

     // Verify alignment accuracy (updated to match test-flight implementation)
     verifyAlignmentTestFlight() {
          if (!this.craneObject || !this.projectionPoint) {
               return false;
          }

          // Recalculate the alignment vector after transformation
          const craneCentroid = this.objectCenter.clone();
          const newCentroidToProjection = new THREE.Vector3().subVectors(this.projectionPoint, craneCentroid);
          newCentroidToProjection.normalize();

          // Calculate the angle between the vectors
          const dotProduct = newCentroidToProjection.dot(this.referenceVector);
          const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
          const angleDegrees = THREE.MathUtils.radToDeg(angle);

          // Check if vectors are aligned (within tolerance)
          const tolerance = 0.5; // degrees
          const isVectorAligned = angleDegrees < tolerance;

          this.isAligned = isVectorAligned;
          return isVectorAligned;
     }

     // Update alignment vector visualization
     updateAlignmentVectorVisualization(scene = null) {
          // Remove existing arrow
          if (this.alignmentVectorArrow && scene) {
               scene.remove(this.alignmentVectorArrow);
               this.alignmentVectorArrow = null;
          }

          if (!this.projectionPoint || !this.objectCenter) {
               return;
          }

          // Calculate vector properties
          const vectorDirection = new THREE.Vector3().subVectors(this.projectionPoint, this.objectCenter);
          const vectorLength = vectorDirection.length();

          if (vectorLength < 0.001) {
               return;
          }

          vectorDirection.normalize();

          const arrowColor = 0xffff00; // Yellow
          const headLength = Math.min(1.0, vectorLength * 0.2);
          const headWidth = Math.min(0.6, vectorLength * 0.15);

          this.alignmentVectorArrow = new THREE.ArrowHelper(
               vectorDirection,
               this.objectCenter,
               vectorLength,
               arrowColor,
               headLength,
               headWidth
          );

          if (scene) {
               scene.add(this.alignmentVectorArrow);
          }

          return this.alignmentVectorArrow;
     }

     // Update reference vector visualization
     updateReferenceVectorVisualization(scene = null, origin = null, length = 10) {
          // Remove existing arrow
          if (this.referenceVectorArrow && scene) {
               scene.remove(this.referenceVectorArrow);
               this.referenceVectorArrow = null;
          }

          const startPoint = origin || new THREE.Vector3(0, 0, 0);
          const arrowColor = 0xff8800; // Orange
          const headLength = Math.min(2.0, length * 0.15);
          const headWidth = Math.min(1.0, length * 0.1);

          this.referenceVectorArrow = new THREE.ArrowHelper(
               this.referenceVector.clone(),
               startPoint,
               length,
               arrowColor,
               headLength,
               headWidth
          );

          if (scene) {
               scene.add(this.referenceVectorArrow);
          }

          return this.referenceVectorArrow;
     }

     // Update up vector visualization
     updateUpVectorVisualization(scene = null, origin = null, length = 8) {
          // Remove existing arrow
          if (this.upVectorArrow && scene) {
               scene.remove(this.upVectorArrow);
               this.upVectorArrow = null;
          }

          const startPoint = origin || new THREE.Vector3(0, 0, 0);
          const arrowColor = 0x00ff00; // Green
          const headLength = Math.min(1.6, length * 0.15);
          const headWidth = Math.min(0.8, length * 0.1);

          this.upVectorArrow = new THREE.ArrowHelper(
               this.upVector.clone(),
               startPoint,
               length,
               arrowColor,
               headLength,
               headWidth
          );

          if (scene) {
               scene.add(this.upVectorArrow);
          }

          return this.upVectorArrow;
     }

     // Remove alignment visualization arrows
     removeAlignmentVisualization(scene = null) {
          if (this.alignmentVectorArrow && scene) {
               scene.remove(this.alignmentVectorArrow);
               this.alignmentVectorArrow = null;
          }

          if (this.referenceVectorArrow && scene) {
               scene.remove(this.referenceVectorArrow);
               this.referenceVectorArrow = null;
          }

          if (this.upVectorArrow && scene) {
               scene.remove(this.upVectorArrow);
               this.upVectorArrow = null;
          }
     }

     // Compute the tracking vector using face centroids and crane centroid
     computeTrackingVector() {
          if (!this.face2Centroid || !this.face5Centroid) {
               return this.trackingVector; // Return current tracking vector
          }

          // Calculate midpoint between face 2 and face 5 centroids
          const midpoint = new THREE.Vector3().addVectors(this.face2Centroid, this.face5Centroid).multiplyScalar(0.5);

          // The tracking vector should point from the crane center toward the head (midpoint)
          this.trackingVector.subVectors(midpoint, this.objectCenter);

          // Normalize the vector to get a unit direction vector
          if (this.trackingVector.length() > 0) {
               this.trackingVector.normalize();
          } else {
               // Fallback to default direction if vector is zero
               this.trackingVector.set(1, 0, 0);
          }

          return this.trackingVector;
     }

     // Update face centroids and recompute tracking vector (useful after transformations)
     updateTrackingVector() {
          if (this.faces.length > 2) {
               this.face2Centroid = CraneUtilities.calculateFaceCentroid(2, this);
          }

          if (this.faces.length > 5) {
               this.face5Centroid = CraneUtilities.calculateFaceCentroid(5, this);
          }

          // Recompute the object center
          if (this.craneObject) {
               const box = new THREE.Box3().setFromObject(this.craneObject);
               this.objectCenter.copy(box.getCenter(new THREE.Vector3()));
          }

          return this.computeTrackingVector();
     }

     // Get tracking vector in world coordinates
     getWorldTrackingVector() {
          if (!this.craneObject) {
               return this.trackingVector.clone();
          }

          // Create a temporary vector in local space
          const localVector = this.trackingVector.clone();

          // Transform to world space using the crane's transformation matrix
          // Note: We only apply rotation/scale, not translation since it's a direction vector
          const worldVector = localVector.clone();
          worldVector.transformDirection(this.craneObject.matrixWorld);

          return worldVector;
     }

     // Get tracking vector origin position in world coordinates
     getWorldTrackingOrigin() {
          if (!this.craneObject) {
               return this.objectCenter.clone();
          }

          // Transform the object center to world coordinates
          const worldOrigin = this.objectCenter.clone();
          worldOrigin.applyMatrix4(this.craneObject.matrixWorld);

          return worldOrigin;
     }

     // Create or update the tracking vector visualization arrow
     updateTrackingVectorArrow(scene = null) {
          // Remove existing arrow if it exists
          if (this.trackingVectorArrow && scene) {
               scene.remove(this.trackingVectorArrow);
               this.trackingVectorArrow = null;
          }

          // Only create arrow if we have valid tracking data
          if (!this.face2Centroid || !this.face5Centroid) {
               return;
          }

          // Get world space tracking vector and origin
          const worldOrigin = this.getWorldTrackingOrigin();
          const worldTrackingVector = this.getWorldTrackingVector();

          // Ensure the vector has valid length
          if (worldTrackingVector.length() < 0.001) {
               return;
          }

          // Create arrow helper to visualize the tracking vector
          const arrowLength = 8; // Length of the arrow
          const arrowColor = 0xffa500; // Orange color to distinguish from other arrows
          const headLength = 1.5;
          const headWidth = 0.8;

          this.trackingVectorArrow = new THREE.ArrowHelper(
               worldTrackingVector.normalize(), // direction (normalized)
               worldOrigin, // origin position
               arrowLength,
               arrowColor,
               headLength,
               headWidth
          );

          // Add to scene if provided
          if (scene) {
               scene.add(this.trackingVectorArrow);
          }

          return this.trackingVectorArrow;
     }

     // Remove tracking vector arrow from scene
     removeTrackingVectorArrow(scene = null) {
          if (this.trackingVectorArrow && scene) {
               scene.remove(this.trackingVectorArrow);
               this.trackingVectorArrow = null;
          }
     }

     // Update tracking vector and its visualization
     updateTrackingVectorWithVisualization(scene = null) {
          // Update the tracking vector calculation
          this.updateTrackingVector();

          // Update the visualization
          this.updateTrackingVectorArrow(scene);

          return this.trackingVector;
     }

     // Load crane model from OBJ object
     loadFromOBJObject(objObject) {
          this.craneObject = objObject;
          this.model = this.craneObject; // Set model property for scene.add()
          this.craneObject.visible = true;

          // Apply current position
          this.craneObject.position.copy(this.position);
          this.craneObject.updateMatrixWorld(true);
     }
}

// Crane Group class to manage multiple crane instances with shared shader materials
export class CraneGroup {
     constructor(groupId) {
          this.groupId = groupId;
          this.cranes = []; // Array of CraneInstance objects
          this.sharedMaterials = null; // Shared shader materials
          this.groupColor = 0xffffff; // Default white color

          // Visual configuration options
          this.wireframeWidth = DEFAULT_WIREFRAME_WIDTH; // Configurable wireframe width
          this.craneTransparency = DEFAULT_CRANE_TRANSPARENCY; // Configurable crane transparency (alpha)
          this.useWhiteColorOnly = false; // Option to color all cranes white

          // Color cycling for individual cranes
          this.colorPalette = [
               0xffffff, // #ffffff
               0xfbc4ae, // #fbc4ae
               0xb3cde3, // #b3cde3
               0xccebc5, // #ccebc5
               0xffffcc, // #ffffcc
               0xdecbe4, // #decbe4
               0xfed9a6, // #fed9a6
               0xffffcc, // #ffffcc (duplicate)
               0xe5d8bd, // #e5d8bd
               0xf2f2f2, // #f2f2f2
          ];
          this.currentColorIndex = 0; // Track current position in color cycle

          // Shared shader strings (created once for the group)
          this.vertexShader = null;
          this.solidFragmentShader = null;
          this.wireframeFragmentShader = null;

          // Create shared shaders for this group
          this.createSharedShaders();
     }

     // Create shared shader strings for all cranes in this group
     createSharedShaders() {
          // Wing flapping vertex shader with lighting support (shared by all cranes in group)
          this.vertexShader = `
            uniform float time1;
            uniform float time2;
            uniform float rotationAngle1;
            uniform float rotationAngle2;
            uniform bool isAnimating1;
            uniform bool isAnimating2;
            uniform vec3 hingeAxis1;
            uniform vec3 hingeAxis2;
            uniform vec3 hingePoint1;
            uniform vec3 hingePoint2;
            
            attribute float vertexSelection1;
            attribute float vertexSelection2;
            
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;
            varying float vSelected1;
            varying float vSelected2;
            
            // Rotate a point around an arbitrary axis using Rodrigues' rotation formula
            vec3 rotateAroundAxis(vec3 point, vec3 axis, vec3 center, float angle) {
                vec3 p = point - center;
                
                // Rodrigues' rotation formula
                vec3 rotated = p * cos(angle) + 
                               cross(axis, p) * sin(angle) + 
                               axis * dot(axis, p) * (1.0 - cos(angle));
                
                return rotated + center;
            }
            
            void main() {
                vec3 newPosition = position;
                vec3 newNormal = normal;
                vSelected1 = vertexSelection1;
                vSelected2 = vertexSelection2;
                
                // Apply Set 1 animation (first wing)
                if (isAnimating1 && vertexSelection1 > 0.5) {
                    vec3 toHinge1 = position - hingePoint1;
                    vec3 projected1 = hingePoint1 + hingeAxis1 * dot(toHinge1, hingeAxis1);
                    float distanceFromHinge1 = length(position - projected1);
                    float falloff1 = smoothstep(0.0, 2.0, distanceFromHinge1);
                    float animAngle1 = sin(time1 * 3.0) * rotationAngle1 * falloff1;
                    newPosition = rotateAroundAxis(newPosition, hingeAxis1, hingePoint1, animAngle1);
                    
                    // Rotate normal as well for proper lighting
                    newNormal = rotateAroundAxis(newNormal, hingeAxis1, vec3(0.0), animAngle1);
                }
                
                // Apply Set 2 animation (second wing)
                if (isAnimating2 && vertexSelection2 > 0.5) {
                    vec3 toHinge2 = newPosition - hingePoint2;
                    vec3 projected2 = hingePoint2 + hingeAxis2 * dot(toHinge2, hingeAxis2);
                    float distanceFromHinge2 = length(newPosition - projected2);
                    float falloff2 = smoothstep(0.0, 2.0, distanceFromHinge2);
                    float animAngle2 = sin(time2 * 3.0) * rotationAngle2 * falloff2;
                    newPosition = rotateAroundAxis(newPosition, hingeAxis2, hingePoint2, animAngle2);
                    
                    // Rotate normal as well for proper lighting
                    newNormal = rotateAroundAxis(newNormal, hingeAxis2, vec3(0.0), animAngle2);
                }
                
                vPosition = newPosition;
                vNormal = normalize(newNormal);
                
                // Calculate world space position and normal for lighting
                vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
                vWorldPosition = worldPosition.xyz;
                vWorldNormal = normalize(normalMatrix * newNormal);
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `;

          // Enhanced fragment shader with proper lighting support
          this.solidFragmentShader = `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            varying vec3 vWorldNormal;
            varying float vSelected1;
            varying float vSelected2;
            
            uniform vec3 craneColor;
            uniform float craneAlpha;
            uniform float ambientLightIntensity;
            uniform vec3 ambientLightColor;
            uniform float directionalLightIntensity;
            uniform vec3 directionalLightColor;
            uniform vec3 directionalLightDirection;
            uniform bool useExternalLighting;
            
            void main() {
                vec3 color = craneColor;
                
                if (useExternalLighting) {
                    // Ambient lighting contribution
                    vec3 ambient = ambientLightColor * ambientLightIntensity;
                    
                    // Directional lighting calculation
                    vec3 normalizedNormal = normalize(vWorldNormal);
                    vec3 normalizedLightDir = normalize(-directionalLightDirection);
                    float diff = max(dot(normalizedNormal, normalizedLightDir), 0.0);
                    vec3 diffuse = directionalLightColor * directionalLightIntensity * diff;
                    
                    // Combine lighting
                    vec3 finalLighting = ambient + diffuse;
                    color = color * finalLighting;
                } else {
                    // Simple lighting calculation (fallback)
                    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                    float diff = max(dot(normalize(vNormal), lightDir), 0.0);
                    color = color * (0.6 + 0.4 * diff);
                }
                
                gl_FragColor = vec4(color, craneAlpha);
            }
        `;

          // Fragment shader for wireframe remains the same
          this.wireframeFragmentShader = `
            void main() {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        `;
     }

     // Add a crane instance to this group
     addCrane(crane) {
          this.cranes.push(crane);
          crane.parentGroup = this; // Reference back to the group

          // Assign next color in cycle to this crane
          const craneColor = this.getNextColor();
          crane.assignedColor = craneColor;
     }

     // Get the next color in the cycle
     getNextColor() {
          const color = this.colorPalette[this.currentColorIndex];
          this.currentColorIndex = (this.currentColorIndex + 1) % this.colorPalette.length;
          return color;
     }

     // Reset color cycle to beginning
     resetColorCycle() {
          this.currentColorIndex = 0;
     }

     // Get current color without advancing the cycle
     getCurrentColor() {
          return this.colorPalette[this.currentColorIndex];
     }

     // Set a specific starting position in the color cycle
     setColorCyclePosition(index) {
          if (index >= 0 && index < this.colorPalette.length) {
               this.currentColorIndex = index;
          }
     }

     // Remove a crane instance from this group
     removeCrane(craneId) {
          const index = this.cranes.findIndex((crane) => crane.id === craneId);
          if (index !== -1) {
               this.cranes[index].parentGroup = null;
               this.cranes.splice(index, 1);
               console.log(`Crane ${craneId} removed from CraneGroup ${this.groupId}`);
          }
     }

     // Apply shared materials to a specific crane
     applyShadersToTarget(crane, craneColor = null) {
          // Use crane's assigned color if no color is specified
          let finalColor = craneColor || crane.assignedColor || this.groupColor;

          // Override color to white if useWhiteColorOnly is enabled
          if (this.useWhiteColorOnly) {
               finalColor = 0xffffff;
          }
          // Get vertex data for both wing animation sets
          const set1Data =
               crane.animationSet1.selectedFaceIndices.length > 0
                    ? {
                           selectedVertices: this.getVerticesFromSelectedFaces(
                                crane.animationSet1.selectedFaceIndices,
                                crane
                           ),
                           hingeData: this.calculateHingeAnimation([], crane.animationSet1.hingeEdgeData),
                      }
                    : null;

          const set2Data =
               crane.animationSet2.selectedFaceIndices.length > 0
                    ? {
                           selectedVertices: this.getVerticesFromSelectedFaces(
                                crane.animationSet2.selectedFaceIndices,
                                crane
                           ),
                           hingeData: this.calculateHingeAnimation([], crane.animationSet2.hingeEdgeData),
                      }
                    : null;

          // Apply shared materials to all mesh groups in the crane
          crane.meshGroups.forEach((group) => {
               const solidMesh = group.userData.solidMesh;
               const wireframeMesh = group.userData.wireframeMesh;
               const solidGeometry = solidMesh.geometry;
               const wireframeGeometry = wireframeMesh.geometry;

               // Create vertex selection arrays for both sets
               const solidVertexSelection1 = new Float32Array(solidGeometry.attributes.position.count);
               const wireframeVertexSelection1 = new Float32Array(wireframeGeometry.attributes.position.count);
               const solidVertexSelection2 = new Float32Array(solidGeometry.attributes.position.count);
               const wireframeVertexSelection2 = new Float32Array(wireframeGeometry.attributes.position.count);

               solidVertexSelection1.fill(0.0);
               wireframeVertexSelection1.fill(0.0);
               solidVertexSelection2.fill(0.0);
               wireframeVertexSelection2.fill(0.0);

               // Mark vertices for Set 1
               if (set1Data) {
                    set1Data.selectedVertices.forEach((vertexIndex) => {
                         if (vertexIndex < solidVertexSelection1.length) {
                              solidVertexSelection1[vertexIndex] = 1.0;
                         }
                         if (vertexIndex < wireframeVertexSelection1.length) {
                              wireframeVertexSelection1[vertexIndex] = 1.0;
                         }
                    });
               }

               // Mark vertices for Set 2
               if (set2Data) {
                    set2Data.selectedVertices.forEach((vertexIndex) => {
                         if (vertexIndex < solidVertexSelection2.length) {
                              solidVertexSelection2[vertexIndex] = 1.0;
                         }
                         if (vertexIndex < wireframeVertexSelection2.length) {
                              wireframeVertexSelection2[vertexIndex] = 1.0;
                         }
                    });
               }

               // Create uniforms linking to this specific crane's animation uniforms
               const combinedUniforms = {
                    // Animation uniforms
                    time1: crane.animationSet1.animationUniforms.time,
                    time2: crane.animationSet2.animationUniforms.time,
                    rotationAngle1: crane.animationSet1.animationUniforms.rotationAngle,
                    rotationAngle2: crane.animationSet2.animationUniforms.rotationAngle,
                    isAnimating1: crane.animationSet1.animationUniforms.isAnimating,
                    isAnimating2: crane.animationSet2.animationUniforms.isAnimating,
                    hingeAxis1: {
                         value: set1Data?.hingeData?.axis || new THREE.Vector3(1, 0, 0),
                    },
                    hingeAxis2: {
                         value: set2Data?.hingeData?.axis || new THREE.Vector3(0, 1, 0),
                    },
                    hingePoint1: {
                         value: set1Data?.hingeData?.point || new THREE.Vector3(0, 0, 0),
                    },
                    hingePoint2: {
                         value: set2Data?.hingeData?.point || new THREE.Vector3(0, 0, 0),
                    },
                    // Material uniforms
                    craneColor: {
                         value: new THREE.Color(finalColor),
                    },
                    craneAlpha: {
                         value: this.craneTransparency,
                    },
                    // Lighting uniforms
                    ambientLightIntensity: crane.lightingUniforms.ambientLightIntensity,
                    ambientLightColor: crane.lightingUniforms.ambientLightColor,
                    directionalLightIntensity: crane.lightingUniforms.directionalLightIntensity,
                    directionalLightColor: crane.lightingUniforms.directionalLightColor,
                    directionalLightDirection: crane.lightingUniforms.directionalLightDirection,
                    useExternalLighting: crane.lightingUniforms.useExternalLighting,
               };

               // Create shader materials using the group's shared shaders
               const solidAnimatedMaterial = new THREE.ShaderMaterial({
                    uniforms: combinedUniforms,
                    vertexShader: this.vertexShader,
                    fragmentShader: this.solidFragmentShader,
                    side: THREE.DoubleSide,
                    transparent: true,
               });

               const wireframeAnimatedMaterial = new THREE.ShaderMaterial({
                    uniforms: { ...combinedUniforms },
                    vertexShader: this.vertexShader,
                    fragmentShader: this.wireframeFragmentShader,
               });

               // Set vertex selection attributes
               solidGeometry.setAttribute("vertexSelection1", new THREE.BufferAttribute(solidVertexSelection1, 1));
               solidGeometry.setAttribute("vertexSelection2", new THREE.BufferAttribute(solidVertexSelection2, 1));
               wireframeGeometry.setAttribute(
                    "vertexSelection1",
                    new THREE.BufferAttribute(wireframeVertexSelection1, 1)
               );
               wireframeGeometry.setAttribute(
                    "vertexSelection2",
                    new THREE.BufferAttribute(wireframeVertexSelection2, 1)
               );

               // Apply materials
               solidMesh.material = solidAnimatedMaterial;
               wireframeMesh.material = wireframeAnimatedMaterial;
          });
     }

     // Apply materials to all cranes in the group
     applyMaterialsToAllCranes(useIndividualColors = true) {
          this.cranes.forEach((crane) => {
               if (useIndividualColors && crane.assignedColor) {
                    this.applyShadersToTarget(crane, crane.assignedColor);
               } else {
                    this.applyShadersToTarget(crane, this.groupColor);
               }
          });
     }

     // Update the group color and apply to all cranes
     updateGroupColor(newColor) {
          this.groupColor = newColor;
          this.cranes.forEach((crane) => {
               crane.meshGroups.forEach((group) => {
                    const solidMesh = group.userData.solidMesh;
                    if (solidMesh.material && solidMesh.material.uniforms && solidMesh.material.uniforms.craneColor) {
                         solidMesh.material.uniforms.craneColor.value.set(newColor);
                    }
               });
          });
     }

     // Reassign colors to all cranes using the color cycle
     reassignCraneColors(startFromBeginning = true) {
          if (startFromBeginning) {
               this.resetColorCycle();
          }

          this.cranes.forEach((crane) => {
               const newColor = this.getNextColor();
               crane.assignedColor = newColor;

               // Update the material color immediately
               crane.meshGroups.forEach((group) => {
                    const solidMesh = group.userData.solidMesh;
                    if (solidMesh.material && solidMesh.material.uniforms && solidMesh.material.uniforms.craneColor) {
                         solidMesh.material.uniforms.craneColor.value.set(newColor);
                    }
               });
          });
     }

     // Get color statistics for the group
     getColorStatistics() {
          const colorCounts = {};
          const colors = [];

          this.cranes.forEach((crane) => {
               if (crane.assignedColor !== undefined) {
                    const colorHex = `#${crane.assignedColor.toString(16).padStart(6, "0")}`;
                    colorCounts[colorHex] = (colorCounts[colorHex] || 0) + 1;
                    colors.push(colorHex);
               }
          });

          return {
               totalCranes: this.cranes.length,
               colorCounts: colorCounts,
               colors: colors,
               uniqueColors: Object.keys(colorCounts).length,
               currentCyclePosition: this.currentColorIndex,
               nextColor: `#${this.getCurrentColor().toString(16).padStart(6, "0")}`,
          };
     }

     // Visual appearance control methods

     // Set all cranes to white color only
     setAllCranesWhite(enableWhiteOnly = true) {
          this.useWhiteColorOnly = enableWhiteOnly;

          // Reapply materials to all cranes to update colors
          this.cranes.forEach((crane) => {
               crane.meshGroups.forEach((group) => {
                    const solidMesh = group.userData.solidMesh;
                    if (solidMesh.material && solidMesh.material.uniforms && solidMesh.material.uniforms.craneColor) {
                         const newColor = enableWhiteOnly ? 0xffffff : crane.assignedColor || this.groupColor;
                         solidMesh.material.uniforms.craneColor.value.set(newColor);
                    }
               });
          });

          console.log(`CraneGroup ${this.groupId}: White-only mode ${enableWhiteOnly ? "enabled" : "disabled"}`);
     }

     // Set wireframe line width for all cranes
     setWireframeWidth(width) {
          this.wireframeWidth = Math.max(0.1, width); // Ensure minimum width

          // Update existing wireframe materials
          this.cranes.forEach((crane) => {
               crane.meshGroups.forEach((group) => {
                    const wireframeMesh = group.userData.wireframeMesh;
                    if (wireframeMesh && wireframeMesh.material) {
                         wireframeMesh.material.linewidth = this.wireframeWidth;
                    }
               });
          });

          console.log(`CraneGroup ${this.groupId}: Wireframe width set to ${this.wireframeWidth}`);
     }

     // Set crane transparency (alpha) for all cranes
     setCraneTransparency(alpha) {
          this.craneTransparency = Math.max(0.0, Math.min(1.0, alpha)); // Clamp between 0 and 1

          // Update existing materials
          this.cranes.forEach((crane) => {
               crane.meshGroups.forEach((group) => {
                    const solidMesh = group.userData.solidMesh;
                    if (solidMesh.material && solidMesh.material.uniforms && solidMesh.material.uniforms.craneAlpha) {
                         solidMesh.material.uniforms.craneAlpha.value = this.craneTransparency;
                    }
               });
          });

          console.log(`CraneGroup ${this.groupId}: Crane transparency set to ${this.craneTransparency}`);
     }

     // Get current visual settings
     getVisualSettings() {
          return {
               wireframeWidth: this.wireframeWidth,
               craneTransparency: this.craneTransparency,
               useWhiteColorOnly: this.useWhiteColorOnly,
               groupColor: `#${this.groupColor.toString(16).padStart(6, "0")}`,
          };
     }

     // Apply all visual settings to existing cranes (useful after loading)
     applyVisualSettings() {
          this.setWireframeWidth(this.wireframeWidth);
          this.setCraneTransparency(this.craneTransparency);
          this.setAllCranesWhite(this.useWhiteColorOnly);
     }

     // Start wing flapping for all cranes in the group
     startAllWingFlapping() {
          this.cranes.forEach((crane) => crane.startWingFlap());
     }

     // Stop wing flapping for all cranes in the group
     stopAllWingFlapping() {
          this.cranes.forEach((crane) => crane.stopWingFlap());
     }

     // Update animations for all cranes in the group
     updateAllAnimations(wingFlapSpeed = 7.5, wingFlapEnabled = true) {
          this.cranes.forEach((crane) => crane.updateAnimation(wingFlapSpeed, wingFlapEnabled));
     }

     // Lighting control methods for the group
     setGroupAmbientLightIntensity(intensity) {
          this.cranes.forEach((crane) => crane.setAmbientLightIntensity(intensity));
     }

     setGroupAmbientLightColor(color) {
          this.cranes.forEach((crane) => crane.setAmbientLightColor(color));
     }

     setGroupDirectionalLightIntensity(intensity) {
          this.cranes.forEach((crane) => crane.setDirectionalLightIntensity(intensity));
     }

     setGroupDirectionalLightColor(color) {
          this.cranes.forEach((crane) => crane.setDirectionalLightColor(color));
     }

     setGroupDirectionalLightDirection(direction) {
          this.cranes.forEach((crane) => crane.setDirectionalLightDirection(direction));
     }

     setGroupUseExternalLighting(useExternal) {
          this.cranes.forEach((crane) => crane.setUseExternalLighting(useExternal));
     }

     // Update all cranes from external Three.js lights
     updateAllFromSceneLights(lights) {
          this.cranes.forEach((crane) => crane.updateFromSceneLights(lights));
     }

     // Get all cranes in the group
     getCranes() {
          return this.cranes;
     }

     // Get crane count
     getCraneCount() {
          return this.cranes.length;
     }

     // Get vertices from selected faces (group utility method)
     getVerticesFromSelectedFaces(faceIndices, crane) {
          const selectedVertices = new Set();

          faceIndices.forEach((faceIndex) => {
               if (faceIndex < crane.faces.length) {
                    const face = crane.faces[faceIndex];
                    selectedVertices.add(face.a);
                    selectedVertices.add(face.b);
                    selectedVertices.add(face.c);
               }
          });

          return Array.from(selectedVertices);
     }

     // Calculate hinge animation data (group utility method)
     calculateHingeAnimation(vertices, hingeEdge) {
          if (!hingeEdge) return null;

          const hingeAxis = new THREE.Vector3().subVectors(hingeEdge.v2, hingeEdge.v1).normalize();
          const hingePoint = hingeEdge.v1.clone();

          return {
               axis: hingeAxis,
               point: hingePoint,
               vertices: vertices,
          };
     }
}

// Utility functions that work with crane instances
export class CraneUtilities {
     // Create wireframe for a crane instance
     static createWireframe(geometry, crane, wireframeWidth = DEFAULT_WIREFRAME_WIDTH) {
          const position = geometry.attributes.position;
          const edgeIndices = [];
          const edgeSet = new Set();
          const meshEdges = [];

          // Extract edges from faces
          for (let i = 0; i < position.count; i += 3) {
               const a = i;
               const b = i + 1;
               const c = i + 2;

               const triangleEdges = [
                    [a, b],
                    [b, c],
                    [c, a],
               ];

               triangleEdges.forEach(([v1, v2]) => {
                    const edgeKey = v1 < v2 ? `${v1}_${v2}` : `${v2}_${v1}`;
                    if (!edgeSet.has(edgeKey)) {
                         edgeSet.add(edgeKey);
                         edgeIndices.push(v1, v2);

                         // Store edge information
                         const edge = {
                              index: meshEdges.length,
                              v1Index: v1,
                              v2Index: v2,
                              v1: new THREE.Vector3().fromBufferAttribute(position, v1),
                              v2: new THREE.Vector3().fromBufferAttribute(position, v2),
                         };
                         meshEdges.push(edge);
                    }
               });
          }

          // Add edges to crane instance
          crane.edges.push(...meshEdges);

          // Create wireframe geometry
          const wireframeGeometry = new THREE.BufferGeometry();
          const originalPositions = geometry.attributes.position.array;
          wireframeGeometry.setAttribute("position", new THREE.BufferAttribute(originalPositions.slice(), 3));
          wireframeGeometry.setIndex(edgeIndices);

          const wireframeMaterial = new THREE.LineBasicMaterial({
               color: 0x000000,
               linewidth: wireframeWidth,
          });

          return new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
     }

     // Extract faces from a mesh for a crane instance
     static extractFaces(mesh, crane) {
          const geometry = mesh.geometry;
          const position = geometry.attributes.position;

          for (let i = 0; i < position.count; i += 3) {
               const face = {
                    index: crane.faces.length,
                    vertices: [i, i + 1, i + 2],
                    mesh: mesh,
                    a: i,
                    b: i + 1,
                    c: i + 2,
               };
               crane.faces.push(face);
          }
     }

     // Calculate centroid of a specific face
     static calculateFaceCentroid(faceIndex, crane) {
          if (faceIndex >= crane.faces.length) {
               return new THREE.Vector3();
          }

          const face = crane.faces[faceIndex];
          const geometry = face.mesh.geometry;
          const position = geometry.attributes.position;

          const centroid = new THREE.Vector3();
          const v1 = new THREE.Vector3().fromBufferAttribute(position, face.a);
          const v2 = new THREE.Vector3().fromBufferAttribute(position, face.b);
          const v3 = new THREE.Vector3().fromBufferAttribute(position, face.c);

          centroid.add(v1).add(v2).add(v3).divideScalar(3);

          // Apply the mesh's world transform
          face.mesh.localToWorld(centroid);

          return centroid;
     }

     // Setup hinge edge data for a crane instance
     static setupHingeEdgeData(crane) {
          if (crane.edges.length > crane.animationSet1.hingeEdgeIndex) {
               crane.animationSet1.hingeEdgeData = crane.edges[crane.animationSet1.hingeEdgeIndex];
          } else {
               console.warn(
                    `Crane ${crane.id}: Animation set 1 hinge edge index ${crane.animationSet1.hingeEdgeIndex} is out of range. Total edges: ${crane.edges.length}`
               );
          }

          if (crane.edges.length > crane.animationSet2.hingeEdgeIndex) {
               crane.animationSet2.hingeEdgeData = crane.edges[crane.animationSet2.hingeEdgeIndex];
          } else {
               console.warn(
                    `Crane ${crane.id}: Animation set 2 hinge edge index ${crane.animationSet2.hingeEdgeIndex} is out of range. Total edges: ${crane.edges.length}`
               );
          }
     }

     // Process a crane instance (extract faces, edges, create wireframes)
     static processCraneInstance(
          crane,
          craneScale = 2.0,
          wireframeWidth = DEFAULT_WIREFRAME_WIDTH
     ) {
          const object = crane.craneObject;

          // Clear arrays for this instance
          crane.meshGroups = [];
          crane.edges = [];
          crane.faces = [];
          crane.directionMatrixUniforms = [];

          // Process each mesh in the crane object
          object.traverse(function (child) {
               if (child.isMesh) {
                    // Store original geometry and material references
                    const originalMaterial = child.material;
                    const geometry = child.geometry;

                    // Create wireframe with configurable width
                    const wireframe = CraneUtilities.createWireframe(geometry, crane, wireframeWidth);

                    // Create a group to hold both solid and wireframe
                    const meshGroup = new THREE.Group();
                    meshGroup.add(child);
                    meshGroup.add(wireframe);

                    // Store references
                    meshGroup.userData = {
                         solidMesh: child,
                         wireframeMesh: wireframe,
                         originalMaterial: originalMaterial,
                    };

                    crane.meshGroups.push(meshGroup);

                    // Replace the child in the object with the group
                    object.remove(child);
                    object.add(meshGroup);
               }
          });

          // Center and scale the model
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const baseScale = 1.5 / maxDim; // Base scale without user scale
          const scale = baseScale * craneScale; // Apply user scale

          object.scale.setScalar(scale);

          // Calculate offset to center the model, then add current position
          const centerOffset = center.multiplyScalar(-scale);
          object.position.copy(crane.position).add(centerOffset);

          // Store the initial scale for relative scaling
          crane.initialScale = baseScale;

          // Update matrices
          object.updateMatrixWorld(true);

          // Calculate the object center after transformation
          crane.updateObjectCenter();

          // Extract faces
          crane.meshGroups.forEach((group) => {
               const solidMesh = group.userData.solidMesh;
               CraneUtilities.extractFaces(solidMesh, crane);
          });

          // Set up animation
          CraneUtilities.setupHingeEdgeData(crane);

          // Calculate face centroids for the direction vector
          if (crane.faces.length > 2) {
               crane.face2Centroid = CraneUtilities.calculateFaceCentroid(2, crane);
          }

          if (crane.faces.length > 5) {
               crane.face5Centroid = CraneUtilities.calculateFaceCentroid(5, crane);
          }

          // Compute initial tracking vector if both face centroids are available
          if (crane.face2Centroid && crane.face5Centroid) {
               crane.computeTrackingVector();
          }

          // Calculate projection point for alignment
          crane.calculateProjectionPoint();
     }

     // Process crane instance and create tracking vector visualization
     static processCraneInstanceWithVisualization(
          crane,
          scene,
          craneScale = 2.0,
          craneColor = 0xffffff,
          wireframeWidth = DEFAULT_WIREFRAME_WIDTH
     ) {
          // First process the crane normally
          this.processCraneInstance(crane, craneScale, craneColor, wireframeWidth);

          // Then create the tracking vector visualization
          if (crane.face2Centroid && crane.face5Centroid) {
               crane.updateTrackingVectorArrow(scene);
          }

          return crane;
     }
}

// Export constants for external use
export { WING_FLAP_ANGLE, DEFAULT_WIREFRAME_WIDTH, DEFAULT_CRANE_TRANSPARENCY };

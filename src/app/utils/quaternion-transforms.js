// Import Three.js modules
import * as THREE from "three";

/**
 * QuaternionTransforms - Utility class for performing constrained quaternion transformations
 * on 3D Three.js objects
 */
export class QuaternionTransforms {
     /**
      * Convert degrees to radians
      * @param {number} degrees - Angle in degrees
      * @returns {number} Angle in radians
      */
     static degreesToRadians(degrees) {
          return degrees * (Math.PI / 180);
     }

     /**
      * Convert radians to degrees
      * @param {number} radians - Angle in radians
      * @returns {number} Angle in degrees
      */
     static radiansToDegrees(radians) {
          return radians * (180 / Math.PI);
     }

     /**
      * Clamp a value between min and max
      * @param {number} value - Value to clamp
      * @param {number} min - Minimum value
      * @param {number} max - Maximum value
      * @returns {number} Clamped value
      */
     static clamp(value, min, max) {
          return Math.min(Math.max(value, min), max);
     }

     /**
      * Extract Euler angles from a quaternion
      * @param {THREE.Quaternion} quaternion - Input quaternion
      * @returns {Object} Object containing roll, pitch, yaw in degrees
      */
     static quaternionToEulerAngles(quaternion) {
          const euler = new THREE.Euler();
          euler.setFromQuaternion(quaternion, "ZYX");

          return {
               roll: this.radiansToDegrees(euler.z),
               pitch: this.radiansToDegrees(euler.x),
               yaw: this.radiansToDegrees(euler.y),
          };
     }

     /**
      * Smoothly interpolate between two rotations using SLERP
      * @param {THREE.Object3D} object - Target Three.js object
      * @param {Object} targetAngles - Target rotation angles in degrees
      * @param {number} alpha - Interpolation factor (0-1)
      * @param {Object} constraints - Optional constraints for target angles
      * @param {Object} options - Additional options
      * @returns {Object} Result information
      */
     static slerpToRotation(object, targetAngles, alpha, constraints = {}, options = {}) {
          const defaultOptions = {
               rotationPoint: null, // Custom rotation point in local space (null = local origin)
          };

          const finalOptions = { ...defaultOptions, ...options };

          // Get current quaternion
          const currentQuaternion = object.quaternion.clone();

          // Create target quaternion with constraints
          const targetResult = this.createConstrainedQuaternion(targetAngles, constraints);
          const targetQuaternion = targetResult.quaternion;

          // Perform SLERP
          const interpolatedQuaternion = new THREE.Quaternion();
          interpolatedQuaternion.slerpQuaternions(currentQuaternion, targetQuaternion, alpha);

          // Apply rotation around custom point if specified
          if (finalOptions.rotationPoint) {
               // Calculate the rotation needed from current to interpolated
               const rotationDelta = new THREE.Quaternion();
               rotationDelta.multiplyQuaternions(interpolatedQuaternion, currentQuaternion.clone().invert());

               this.applyRotationAroundPoint(object, rotationDelta, finalOptions.rotationPoint, true);
          } else {
               // Apply the interpolated rotation directly
               object.quaternion.copy(interpolatedQuaternion);
          }

          object.updateMatrixWorld(true);

          return {
               currentRotation: this.quaternionToEulerAngles(currentQuaternion),
               targetRotation: targetResult.appliedAngles,
               finalRotation: this.quaternionToEulerAngles(object.quaternion),
               interpolationFactor: alpha,
               rotationPoint: finalOptions.rotationPoint,
          };
     }

     /**
      * Create an animated rotation sequence
      * @param {THREE.Object3D} object - Target Three.js object
      * @param {Array} keyframes - Array of rotation keyframes with timing
      * @param {Object} constraints - Optional constraints for all rotations
      * @returns {Function} Animation update function
      */
     static createRotationAnimation(object, keyframes, constraints = {}) {
          // Validate keyframes
          if (!keyframes || keyframes.length < 2) {
               console.warn("QuaternionTransforms: At least 2 keyframes required for animation");
               return null;
          }

          // Sort keyframes by time
          const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

          // Convert angles to quaternions with constraints
          const quaternionKeyframes = sortedKeyframes.map((keyframe) => ({
               time: keyframe.time,
               quaternion: this.createConstrainedQuaternion(keyframe.angles, constraints).quaternion,
               angles: keyframe.angles,
          }));

          let startTime = null;
          const totalDuration = sortedKeyframes[sortedKeyframes.length - 1].time;

          return function updateAnimation(currentTime) {
               if (startTime === null) {
                    startTime = currentTime;
               }

               const elapsedTime = currentTime - startTime;
               const normalizedTime = Math.min(elapsedTime / totalDuration, 1.0);

               // Find the current keyframe segment
               let currentKeyframe = null;
               let nextKeyframe = null;

               for (let i = 0; i < quaternionKeyframes.length - 1; i++) {
                    const keyframe = quaternionKeyframes[i];
                    const nextKey = quaternionKeyframes[i + 1];

                    if (elapsedTime >= keyframe.time && elapsedTime <= nextKey.time) {
                         currentKeyframe = keyframe;
                         nextKeyframe = nextKey;
                         break;
                    }
               }

               if (currentKeyframe && nextKeyframe) {
                    // Calculate interpolation factor within this segment
                    const segmentDuration = nextKeyframe.time - currentKeyframe.time;
                    const segmentElapsed = elapsedTime - currentKeyframe.time;
                    const segmentAlpha = segmentDuration > 0 ? segmentElapsed / segmentDuration : 0;

                    // Interpolate between keyframes
                    const interpolatedQuaternion = new THREE.Quaternion();
                    interpolatedQuaternion.slerpQuaternions(
                         currentKeyframe.quaternion,
                         nextKeyframe.quaternion,
                         segmentAlpha
                    );

                    // Apply to object
                    object.quaternion.copy(interpolatedQuaternion);
                    object.updateMatrixWorld(true);

                    return {
                         isComplete: normalizedTime >= 1.0,
                         progress: normalizedTime,
                         currentSegment: {
                              from: currentKeyframe.angles,
                              to: nextKeyframe.angles,
                              alpha: segmentAlpha,
                         },
                         currentRotation: QuaternionTransforms.quaternionToEulerAngles(interpolatedQuaternion),
                    };
               } else if (normalizedTime >= 1.0) {
                    // Animation complete, set to final rotation
                    const finalKeyframe = quaternionKeyframes[quaternionKeyframes.length - 1];
                    object.quaternion.copy(finalKeyframe.quaternion);
                    object.updateMatrixWorld(true);

                    return {
                         isComplete: true,
                         progress: 1.0,
                         currentSegment: null,
                         currentRotation: QuaternionTransforms.quaternionToEulerAngles(finalKeyframe.quaternion),
                    };
               }

               return {
                    isComplete: false,
                    progress: normalizedTime,
                    currentSegment: null,
                    currentRotation: QuaternionTransforms.quaternionToEulerAngles(object.quaternion),
               };
          };
     }

     /**
      * Reset object rotation to identity (no rotation)
      * @param {THREE.Object3D} object - Target Three.js object
      * @param {boolean} updateMatrices - Whether to update world matrices
      */
     static resetRotation(object, updateMatrices = true) {
          object.quaternion.identity();
          if (updateMatrices) {
               object.updateMatrixWorld(true);
          }
     }

     /**
      * Helper method to apply rotation around a custom point in local space
      * @param {THREE.Object3D} object - Target Three.js object
      * @param {THREE.Quaternion} quaternion - Rotation quaternion to apply
      * @param {THREE.Vector3} rotationPoint - Point to rotate around in local space
      * @param {boolean} relative - Whether to apply relative to current rotation
      */
     static applyRotationAroundPoint(object, quaternion, rotationPoint, relative = false) {
          // Convert rotation point from local space to world space
          const worldRotationPoint = rotationPoint.clone();
          worldRotationPoint.applyMatrix4(object.matrixWorld);

          // Get current world position
          const currentWorldPosition = new THREE.Vector3();
          object.getWorldPosition(currentWorldPosition);

          // Calculate offset from rotation point to current position
          const offsetFromRotationPoint = new THREE.Vector3();
          offsetFromRotationPoint.subVectors(currentWorldPosition, worldRotationPoint);

          // Apply rotation to the object
          if (relative) {
               const currentQuaternion = object.quaternion.clone();
               object.quaternion.multiplyQuaternions(quaternion, currentQuaternion);
          } else {
               object.quaternion.copy(quaternion);
          }

          // Apply rotation to the offset vector
          const rotatedOffset = offsetFromRotationPoint.clone();
          rotatedOffset.applyQuaternion(quaternion);

          // Calculate new world position
          const newWorldPosition = worldRotationPoint.clone().add(rotatedOffset);

          // Convert back to local space and set position
          const parentWorldMatrix = object.parent ? object.parent.matrixWorld : new THREE.Matrix4();
          const parentWorldMatrixInverse = new THREE.Matrix4().copy(parentWorldMatrix).invert();
          const newLocalPosition = newWorldPosition.clone();
          newLocalPosition.applyMatrix4(parentWorldMatrixInverse);

          object.position.copy(newLocalPosition);
     }

     /**
      * Calculate the quaternion that aligns one vector with another
      * @param {THREE.Vector3} fromVector - The source vector (will be normalized)
      * @param {THREE.Vector3} toVector - The target vector (will be normalized)
      * @param {THREE.Vector3} [upVector] - Optional up vector for controlling roll
      * @returns {Object} Object containing the alignment quaternion and additional info
      */
     static calculateVectorAlignmentQuaternion(fromVector, toVector, upVector = null) {
          // Normalize input vectors
          const from = fromVector.clone().normalize();
          const to = toVector.clone().normalize();

          // Check if vectors are already aligned
          const dot = from.dot(to);
          const tolerance = 1e-6;

          if (Math.abs(dot - 1.0) < tolerance) {
               // Vectors are already aligned
               return {
                    quaternion: new THREE.Quaternion(), // Identity quaternion
                    angle: 0,
                    axis: new THREE.Vector3(0, 1, 0), // Arbitrary axis
                    isAligned: true,
                    isOpposite: false,
               };
          }

          if (Math.abs(dot + 1.0) < tolerance) {
               // Vectors are opposite - need to find a perpendicular axis
               let perpAxis = new THREE.Vector3();

               // Find the axis with the smallest component to avoid near-zero cross products
               if (Math.abs(from.x) < Math.abs(from.y) && Math.abs(from.x) < Math.abs(from.z)) {
                    perpAxis.set(1, 0, 0);
               } else if (Math.abs(from.y) < Math.abs(from.z)) {
                    perpAxis.set(0, 1, 0);
               } else {
                    perpAxis.set(0, 0, 1);
               }

               // Create perpendicular vector
               perpAxis.cross(from).normalize();

               // Create 180-degree rotation quaternion
               const quaternion = new THREE.Quaternion();
               quaternion.setFromAxisAngle(perpAxis, Math.PI);

               return {
                    quaternion: quaternion,
                    angle: Math.PI,
                    axis: perpAxis,
                    isAligned: false,
                    isOpposite: true,
               };
          }

          // General case: calculate rotation axis and angle
          const rotationAxis = new THREE.Vector3();
          rotationAxis.crossVectors(from, to).normalize();

          // Calculate rotation angle using the dot product
          const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

          // Create the basic alignment quaternion
          const alignmentQuat = new THREE.Quaternion();
          alignmentQuat.setFromAxisAngle(rotationAxis, angle);

          // If an up vector is provided, we need to handle roll correction
          if (upVector) {
               // Transform the up vector by the alignment quaternion
               const transformedUp = upVector.clone().applyQuaternion(alignmentQuat);

               // Project both the transformed up and target up onto the plane perpendicular to 'to'
               const targetUp = upVector.clone();
               const projectedTransformedUp = transformedUp
                    .clone()
                    .sub(to.clone().multiplyScalar(transformedUp.dot(to)));
               const projectedTargetUp = targetUp.clone().sub(to.clone().multiplyScalar(targetUp.dot(to)));

               // Normalize the projections
               if (projectedTransformedUp.length() > tolerance && projectedTargetUp.length() > tolerance) {
                    projectedTransformedUp.normalize();
                    projectedTargetUp.normalize();

                    // Calculate the roll correction angle
                    const rollDot = projectedTransformedUp.dot(projectedTargetUp);
                    const rollAngle = Math.acos(Math.max(-1, Math.min(1, rollDot)));

                    // Determine the sign of the roll angle
                    const rollCross = new THREE.Vector3();
                    rollCross.crossVectors(projectedTransformedUp, projectedTargetUp);
                    const rollSign = Math.sign(rollCross.dot(to));

                    // Create roll correction quaternion
                    const rollQuat = new THREE.Quaternion();
                    rollQuat.setFromAxisAngle(to, rollSign * rollAngle);

                    // Combine alignment and roll quaternions
                    const finalQuat = new THREE.Quaternion();
                    finalQuat.multiplyQuaternions(rollQuat, alignmentQuat);

                    return {
                         quaternion: finalQuat,
                         angle: angle,
                         axis: rotationAxis,
                         rollAngle: rollSign * rollAngle,
                         rollAxis: to.clone(),
                         isAligned: false,
                         isOpposite: false,
                         hasRollCorrection: true,
                    };
               }
          }

          return {
               quaternion: alignmentQuat,
               angle: angle,
               axis: rotationAxis,
               isAligned: false,
               isOpposite: false,
               hasRollCorrection: false,
          };
     }

     /**
      * Align an object so that one of its local vectors points toward a target vector
      * @param {THREE.Object3D} object - Target Three.js object
      * @param {THREE.Vector3} objectLocalVector - Vector in object's local space (e.g., object's forward direction)
      * @param {THREE.Vector3} worldTargetVector - Target vector in world space
      * @param {THREE.Vector3} [objectUpVector] - Object's up vector in local space for roll control
      * @param {Object} options - Additional options
      * @returns {Object} Result information
      */
     static alignObjectToVector(object, objectLocalVector, worldTargetVector, objectUpVector = null, options = {}) {
          const defaultOptions = {
               updateMatrices: true,
               preservePosition: true,
               relative: false, // If true, applies rotation relative to current rotation
               rotationPoint: null, // Custom rotation point in local space (null = local origin)
          };

          const finalOptions = { ...defaultOptions, ...options };

          // Store original position if needed
          const originalPosition = finalOptions.preservePosition ? object.position.clone() : null;

          // Get the current direction of the object's local vector in world space
          const currentWorldVector = objectLocalVector.clone();
          if (!finalOptions.relative) {
               // For absolute alignment, we work from the object's initial orientation
               currentWorldVector.applyMatrix4(new THREE.Matrix4().extractRotation(object.matrixWorld));
          } else {
               // For relative alignment, we use the current orientation
               currentWorldVector.transformDirection(object.matrixWorld);
          }

          // Calculate the alignment quaternion
          const alignmentResult = this.calculateVectorAlignmentQuaternion(
               currentWorldVector,
               worldTargetVector.clone().normalize(),
               objectUpVector
          );

          // Apply rotation around custom point if specified
          if (finalOptions.rotationPoint) {
               this.applyRotationAroundPoint(
                    object,
                    alignmentResult.quaternion,
                    finalOptions.rotationPoint,
                    finalOptions.relative
               );
          } else {
               // Standard rotation around local origin
               if (finalOptions.relative) {
                    // Apply rotation relative to current rotation
                    const currentQuaternion = object.quaternion.clone();
                    object.quaternion.multiplyQuaternions(alignmentResult.quaternion, currentQuaternion);
               } else {
                    // Set absolute rotation
                    object.quaternion.copy(alignmentResult.quaternion);
               }
          }

          // Restore position if needed (only if no custom rotation point)
          if (finalOptions.preservePosition && originalPosition && !finalOptions.rotationPoint) {
               object.position.copy(originalPosition);
          }

          // Update matrices if requested
          if (finalOptions.updateMatrices) {
               object.updateMatrixWorld(true);
          }

          return {
               alignmentQuaternion: alignmentResult.quaternion.clone(),
               alignmentAngle: this.radiansToDegrees(alignmentResult.angle),
               alignmentAxis: alignmentResult.axis,
               rollCorrection: alignmentResult.hasRollCorrection
                    ? this.radiansToDegrees(alignmentResult.rollAngle || 0)
                    : 0,
               finalRotation: this.quaternionToEulerAngles(object.quaternion),
               wasAligned: alignmentResult.isAligned,
               wasOpposite: alignmentResult.isOpposite,
               rotationPoint: finalOptions.rotationPoint,
          };
     }

     /**
      * Get the current rotation of an object in various formats
      * @param {THREE.Object3D} object - Target Three.js object
      * @returns {Object} Object containing rotation in different formats
      */
     static getRotationInfo(object) {
          const quaternion = object.quaternion.clone();
          const euler = new THREE.Euler();
          euler.setFromQuaternion(quaternion, "ZYX");

          return {
               quaternion: quaternion,
               euler: {
                    x: euler.x,
                    y: euler.y,
                    z: euler.z,
                    order: euler.order,
               },
               degrees: {
                    roll: this.radiansToDegrees(euler.z),
                    pitch: this.radiansToDegrees(euler.x),
                    yaw: this.radiansToDegrees(euler.y),
               },
               radians: {
                    roll: euler.z,
                    pitch: euler.x,
                    yaw: euler.y,
               },
          };
     }
}

// A utility to animate SVG icons along looping paths with rotation
export class PathAnimator {
     constructor(pathElement, iconElement, options = {}) {
          this.path = pathElement;
          this.icon = iconElement;
          this.options = {
               duration: options.duration || 5000, // milliseconds
               loop: options.loop !== undefined ? options.loop : true,
               autoplay: options.autoplay !== undefined ? options.autoplay : true,
               easing: options.easing || ((t) => t), // linear by default
               startOffset: options.startOffset || 0,
               rotationOffset: options.rotationOffset || 0, // degrees
               hidePath: options.hidePath !== undefined ? options.hidePath : false, // Option to hide the path
          };

          // Path properties
          this.pathLength = this.path.getTotalLength();
          this.startPoint = this.path.getPointAtLength(0);

          // Animation state
          this.animationStartTime = null;
          this.animationFrame = null;
          this.isPaused = false;
          this.progress = 0;

          // Apply path visibility based on hidePath option
          if (this.options.hidePath) {
               this.path.style.strokeOpacity = "0";
          }

          // Set initial positions
          this.positionElementAtProgress(this.options.startOffset / this.pathLength);

          // Start animation if autoplay is true
          if (this.options.autoplay) {
               this.play();
          }
     }

     play() {
          this.isPaused = false;
          cancelAnimationFrame(this.animationFrame);

          // Reset start time if we're starting over
          if (!this.animationStartTime || this.progress >= 1) {
               this.animationStartTime = performance.now();
               this.progress = 0;
          } else {
               // Adjust the start time based on progress if resuming
               this.animationStartTime = performance.now() - this.progress * this.options.duration;
          }

          this.animate();
     }

     pause() {
          this.isPaused = true;
          cancelAnimationFrame(this.animationFrame);
     }

     stop() {
          cancelAnimationFrame(this.animationFrame);
          this.animationStartTime = null;
          this.progress = 0;
          this.positionElementAtProgress(0);
     }

     animate() {
          if (this.isPaused) return;

          const now = performance.now();
          const elapsed = now - this.animationStartTime;
          this.progress = (elapsed % this.options.duration) / this.options.duration;

          // Calculate position and rotation
          this.positionElementAtProgress(this.progress);

          // Check if animation should continue
          if (elapsed >= this.options.duration) {
               if (this.options.loop) {
                    // Reset for next loop
                    this.animationStartTime = now;
               } else {
                    // End animation
                    this.progress = 1;
                    this.positionElementAtProgress(1);
                    return;
               }
          }

          // Continue animation
          this.animationFrame = requestAnimationFrame(() => this.animate());
     }

     positionElementAtProgress(progress) {
          // Get position along the path
          const point = this.path.getPointAtLength(progress * this.pathLength);

          // Calculate rotation angle based on the tangent to the path
          let angle = 0;
          const delta = 0.01; // Small delta to calculate tangent
          const pointAhead = this.path.getPointAtLength(Math.min(progress * this.pathLength + delta, this.pathLength));

          // Calculate the angle from the tangent
          angle =
               Math.atan2(pointAhead.y - point.y, pointAhead.x - point.x) * (180 / Math.PI) +
               this.options.rotationOffset;

          // Apply transforms
          this.icon.style.transform = `translate(${point.x}px, ${point.y}px) rotate(${angle}deg)`;
     }

     // Update animation options
     updateOptions(newOptions) {
          this.options = { ...this.options, ...newOptions };

          // If we change duration while animating, adjust the start time
          if (this.animationStartTime && !this.isPaused) {
               const elapsed = performance.now() - this.animationStartTime;
               const oldProgress = elapsed / this.options.duration;
               this.animationStartTime = performance.now() - oldProgress * this.options.duration;
          }
     }
}

// Create a path animator for a looping path
export function createLoopingPathAnimator(pathSelector, iconSelector, options = {}) {
     const path = document.querySelector(pathSelector);
     const icon = document.querySelector(iconSelector);

     if (!path || !icon) {
          console.error("Path or icon element not found");
          return null;
     }

     // Position the icon element appropriately
     icon.style.position = "absolute";
     icon.style.transformOrigin = "center";

     return new PathAnimator(path, icon, options);
}

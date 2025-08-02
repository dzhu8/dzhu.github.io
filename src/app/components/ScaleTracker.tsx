"use client";

import { useEffect } from "react";

export default function ScaleTracker() {
     useEffect(() => {
          const updateScale = () => {
               const currentWidth = window.innerWidth;
               const baseWidth = 2048; // Base design width
               const rawScale = currentWidth / baseWidth;
               const minScale = 0.3; // Minimum scale factor to prevent text from being too small
               const calculatedScale = Math.max(rawScale, minScale);

               // Navbar scale factor: scales up but not down (minimum 1.0)
               const navbarScaleValue = Math.max(rawScale, 1.0);

               // Dampened scale factor: scales less aggressively
               // Formula: 0.5 + (rawScale * 0.5) - this gives 75% when rawScale is 0.5
               const dampenedScaleValue = Math.max(0.5 + rawScale * 0.5, 0.5);

               // Update CSS custom properties
               document.documentElement.style.setProperty("--scale-factor", calculatedScale.toString());
               document.documentElement.style.setProperty("--navbar-scale-factor", navbarScaleValue.toString());
               document.documentElement.style.setProperty("--dampened-scale-factor", dampenedScaleValue.toString());
          };

          // Initial calculation
          updateScale();

          // Listen for resize events
          window.addEventListener("resize", updateScale);

          return () => {
               window.removeEventListener("resize", updateScale);
          };
     }, []);

     return (
          null // No UI rendered, but scale calculations still run
     );
}

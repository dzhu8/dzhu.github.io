"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollFadeInProps {
     children: React.ReactNode;
     delay?: number; // Delay in milliseconds before animation starts
     duration?: number; // Duration of animation in milliseconds
     threshold?: number; // Intersection observer threshold (0-1)
     direction?: "up" | "left" | "right" | "fade"; // Animation direction
     distance?: number; // Distance to animate from (in pixels)
     className?: string;
}

export default function ScrollFadeIn({
     children,
     delay = 0,
     duration = 600,
     threshold = 0.1,
     direction = "up",
     distance = 30,
     className = "",
}: ScrollFadeInProps) {
     const elementRef = useRef<HTMLDivElement>(null);
     const [isVisible, setIsVisible] = useState(false);
     const timeoutRef = useRef<NodeJS.Timeout | null>(null);

     useEffect(() => {
          const observer = new IntersectionObserver(
               ([entry]) => {
                    if (entry.isIntersecting) {
                         // Clear any existing timeout
                         if (timeoutRef.current) {
                              clearTimeout(timeoutRef.current);
                         }
                         // Set new timeout for animation
                         timeoutRef.current = setTimeout(() => {
                              setIsVisible(true);
                         }, delay);
                    } else {
                         // Element is out of view, reset animation
                         if (timeoutRef.current) {
                              clearTimeout(timeoutRef.current);
                         }
                         setIsVisible(false);
                    }
               },
               {
                    threshold,
                    rootMargin: "0px 0px -50px 0px", // Trigger slightly before element is fully visible
               }
          );

          const currentElement = elementRef.current;
          if (currentElement) {
               observer.observe(currentElement);
          }

          return () => {
               if (currentElement) {
                    observer.unobserve(currentElement);
               }
               if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
               }
          };
     }, [delay, threshold]);

     // Calculate transform based on direction
     const getTransform = () => {
          if (isVisible) return "translate3d(0, 0, 0)";

          switch (direction) {
               case "up":
                    return `translate3d(0, ${distance}px, 0)`;
               case "left":
                    return `translate3d(-${distance}px, 0, 0)`;
               case "right":
                    return `translate3d(${distance}px, 0, 0)`;
               case "fade":
               default:
                    return "translate3d(0, 0, 0)";
          }
     };

     return (
          <div
               ref={elementRef}
               className={`transition-all ease-out ${className}`}
               style={{
                    opacity: isVisible ? 1 : 0,
                    transform: getTransform(),
                    transitionDuration: `${duration}ms`,
                    transitionProperty: "opacity, transform",
                    willChange: "opacity, transform", // Optimize for animations
               }}
          >
               {children}
          </div>
     );
}

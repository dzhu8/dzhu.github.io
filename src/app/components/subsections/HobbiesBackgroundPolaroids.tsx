"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface PolaroidProps {
     imagePath: string;
     rotation: number;
     position: { x: number; y: number };
}

const Polaroid: React.FC<PolaroidProps> = ({ imagePath, rotation, position }) => {
     const imageHeight = 200; // Base image height as specified
     const polaroidWidth = imageHeight / 0.7; // Calculate polaroid width based on image being 70% of height
     const polaroidHeight = imageHeight / 0.7; // Calculate polaroid height based on image being 70% of height
     const imageWidth = polaroidWidth * 0.9; // Image is 90% the width of polaroid

     return (
          <div
               className="hobbies-polaroid"
               style={{
                    position: "absolute",
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: `${polaroidWidth}px`,
                    height: `${polaroidHeight}px`,
                    transform: `rotate(${rotation}deg) scale(var(--dampened-scale-factor))`,
                    transformOrigin: "center center",
                    zIndex: 2,
               }}
          >
               <div className="polaroid-frame">
                    <div className="polaroid-body">
                         {/* Photo corners */}
                         <div className="polaroid-corner polaroid-corner-tl">
                              <div className="corner-triangle corner-triangle-tl"></div>
                         </div>
                         <div className="polaroid-corner polaroid-corner-tr">
                              <div className="corner-triangle corner-triangle-tr"></div>
                         </div>
                         <div className="polaroid-corner polaroid-corner-bl">
                              <div className="corner-triangle corner-triangle-bl"></div>
                         </div>
                         <div className="polaroid-corner polaroid-corner-br">
                              <div className="corner-triangle corner-triangle-br"></div>
                         </div>

                         {/* Image area - 70% height, 90% width of polaroid */}
                         <div
                              className="polaroid-image-area"
                              style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
                         >
                              <Image
                                   src={imagePath}
                                   alt="Hobby polaroid"
                                   width={imageWidth}
                                   height={imageHeight}
                                   style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                   }}
                              />
                         </div>

                         {/* Caption area - remaining space */}
                         <div className="polaroid-caption-area"></div>
                    </div>
               </div>
          </div>
     );
};

const HobbiesBackgroundPolaroids: React.FC = () => {
     const [polaroidPositions, setPolaroidPositions] = useState<{ x: number; y: number }[]>([]);

     // Calculate positions based on content piece and scale factor
     const calculatePositions = () => {
          const contentPiece = document.querySelector("#hobbies .content-piece") as HTMLElement;
          if (!contentPiece) {
               return;
          }

          const section = document.querySelector("#hobbies") as HTMLElement;
          if (!section) {
               return;
          }

          const contentRect = contentPiece.getBoundingClientRect();
          const sectionRect = section.getBoundingClientRect();

          // Get current scale factor from CSS variables
          const scaleFactorStr = getComputedStyle(document.documentElement).getPropertyValue("--dampened-scale-factor");
          const scaleFactor = parseFloat(scaleFactorStr) || 1;

          // Base polaroid dimensions
          const imageHeight = 200;
          const polaroidWidth = imageHeight / 0.7; // ≈ 285.7px
          const polaroidHeight = imageHeight / 0.7; // ≈ 285.7px

          // Calculate distance for 2.5% viewport width when scale > 0.75
          const targetDistance = window.innerWidth * 0.025;
          const adjustedDistance = scaleFactor > 0.75 ? targetDistance : targetDistance * (scaleFactor / 0.75);

          // Calculate positions relative to section
          const contentLeftRelative = contentRect.left - sectionRect.left;
          const contentRightRelative = contentRect.right - sectionRect.left;
          const contentTopRelative = contentRect.top - sectionRect.top;
          const contentBottomRelative = contentRect.bottom - sectionRect.top;
          const contentCenterY = contentTopRelative + (contentBottomRelative - contentTopRelative) / 2;

          const positions: { x: number; y: number }[] = [];

          // Left column positions (3 polaroids)
          for (let i = 0; i < 3; i++) {
               const polaroidCenterX = contentLeftRelative - adjustedDistance - polaroidWidth / 2;
               const polaroidCenterY = contentCenterY + (i - 1) * (polaroidHeight + 60); // Spread vertically, 60px gap

               positions.push({
                    x: polaroidCenterX - polaroidWidth / 2,
                    y: polaroidCenterY - polaroidHeight / 2,
               });
          }

          // Right column positions (3 polaroids)
          for (let i = 0; i < 3; i++) {
               const polaroidCenterX = contentRightRelative + adjustedDistance + polaroidWidth / 2;
               const polaroidCenterY = contentCenterY + (i - 1) * (polaroidHeight + 60); // Spread vertically, 60px gap

               positions.push({
                    x: polaroidCenterX - polaroidWidth / 2,
                    y: polaroidCenterY - polaroidHeight / 2,
               });
          }

          setPolaroidPositions(positions);

          // If no positions were calculated, use fallback positions
          if (positions.length === 0) {
               const fallbackPositions = [
                    { x: 100, y: 200 }, // Left top
                    { x: 100, y: 400 }, // Left middle
                    { x: 100, y: 600 }, // Left bottom
                    { x: 800, y: 200 }, // Right top
                    { x: 800, y: 400 }, // Right middle
                    { x: 800, y: 600 }, // Right bottom
               ];
               setPolaroidPositions(fallbackPositions);
          }
     };

     useEffect(() => {
          // Initial calculation with longer delay to ensure content is rendered
          const initialTimer = setTimeout(calculatePositions, 500);

          // Recalculate on resize
          const handleResize = () => {
               setTimeout(calculatePositions, 100);
          };

          window.addEventListener("resize", handleResize);

          // Recalculate when scale factor changes (observe CSS variable changes)
          const observer = new MutationObserver(() => {
               calculatePositions();
          });

          observer.observe(document.documentElement, {
               attributes: true,
               attributeFilter: ["style"],
          });

          return () => {
               clearTimeout(initialTimer);
               window.removeEventListener("resize", handleResize);
               observer.disconnect();
          };
     }, []);

     const polaroidData = [
          { imagePath: "/DNA.svg", rotation: -8 }, // Left column, top
          { imagePath: "/DNA.svg", rotation: 5 }, // Left column, middle
          { imagePath: "/DNA.svg", rotation: -3 }, // Left column, bottom
          { imagePath: "/DNA.svg", rotation: 7 }, // Right column, top
          { imagePath: "/DNA.svg", rotation: -6 }, // Right column, middle
          { imagePath: "/DNA.svg", rotation: 4 }, // Right column, bottom
     ];

     return (
          <div className="hobbies-background-polaroids">
               {/* Render polaroids */}
               {polaroidPositions.map((position, index) => (
                    <Polaroid
                         key={index}
                         imagePath={polaroidData[index].imagePath}
                         rotation={polaroidData[index].rotation}
                         position={position}
                    />
               ))}
          </div>
     );
};

export default HobbiesBackgroundPolaroids;

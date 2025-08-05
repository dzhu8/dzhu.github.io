"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface PolaroidProps {
     imagePath: string;
     rotation: number;
     position: { x: number; y: number };
     secondaryImagePath?: string; // Optional secondary image
     secondaryText?: string; // Optional secondary text
}

const Polaroid: React.FC<PolaroidProps> = ({ imagePath, rotation, position, secondaryImagePath, secondaryText }) => {
     const imageHeight = 200; // Base image height as specified
     const polaroidWidth = imageHeight / 0.7; // Calculate polaroid width based on image being 70% of height
     const testAreaHeight = 50; // Height for the secondary area
     const polaroidHeight = imageHeight / 0.7 + testAreaHeight; // Extend polaroid height to include secondary area
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

                         {/* Secondary area - can contain either image or text */}
                         {(secondaryImagePath || secondaryText) && (
                              <div
                                   className="polaroid-secondary-area"
                                   style={{
                                        width: `${imageWidth}px`,
                                        height: `${testAreaHeight}px`,
                                        backgroundColor: "white",
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden",
                                        fontFamily: '"Shantell Sans", cursive', // Same font as navbar
                                        fontSize: "14px",
                                        fontWeight: "400",
                                        color: "#333",
                                        textAlign: "center",
                                        padding: "4px",
                                   }}
                              >
                                   {secondaryImagePath ? (
                                        <Image
                                             src={secondaryImagePath}
                                             alt="Secondary hobby image"
                                             width={imageWidth}
                                             height={testAreaHeight}
                                             style={{
                                                  width: "100%",
                                                  height: "100%",
                                                  objectFit: "contain",
                                             }}
                                        />
                                   ) : (
                                        <span
                                             style={{
                                                  lineHeight: "1.2",
                                                  whiteSpace: "pre-line",
                                             }}
                                        >
                                             {secondaryText}
                                        </span>
                                   )}
                              </div>
                         )}
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
          const testAreaHeight = 30; // Height for the secondary area (reduced by 20px)
          const polaroidHeight = imageHeight / 0.7 + testAreaHeight; // ≈ 315.7px (including secondary area)

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
               const polaroidCenterY = contentCenterY + (i - 1) * (polaroidHeight + 90); // Spread vertically, 90px gap

               positions.push({
                    x: polaroidCenterX - polaroidWidth / 2,
                    y: polaroidCenterY - polaroidHeight / 2,
               });
          }

          // Right column positions (3 polaroids)
          for (let i = 0; i < 3; i++) {
               const polaroidCenterX = contentRightRelative + adjustedDistance + polaroidWidth / 2;
               const polaroidCenterY = contentCenterY + (i - 1) * (polaroidHeight + 90); // Spread vertically, 90px gap

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
          { imagePath: "/Curry.png", rotation: -8, secondaryImagePath: "/Curry_signature.png" }, // Left column, top - with secondary image
          { imagePath: "/Manning.png", rotation: 5, secondaryImagePath: "/Manning_signature.png" }, // Left column, middle
          {
               imagePath: "/Bayern.png",
               rotation: -3,
               secondaryText: "The 2013 Champions League, the last trophy in the treble in an unforgettable year.",
          }, // Left column, bottom
          {
               imagePath: "/Kawhi_game_winner.png",
               rotation: 7,
               secondaryText: "05/12/2019\nThe quadruple doink! My most iconic sports memory.",
          }, // Right column, top
          { imagePath: "/Verstappen.png", rotation: -6, secondaryImagePath: "/Verstappen_signature.png" }, // Right column, middle
          { imagePath: "/OpTic.png", rotation: 4 }, // Right column, bottom
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
                         secondaryImagePath={polaroidData[index].secondaryImagePath}
                         secondaryText={polaroidData[index].secondaryText}
                    />
               ))}
          </div>
     );
};

export default HobbiesBackgroundPolaroids;

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface HobbiesCardProps {
     title: string;
     imagePath: string;
     description?: string;
     titleFontSize?: number; // Font size in pixels, defaults to responsive sizing
}

interface HobbyCardData {
     title: string;
     imagePath?: string;
     description?: string;
     titleFontSize?: number;
}

interface HobbiesContainerProps {
     hobbies: HobbyCardData[];
     showDebugInfo?: boolean;
}

// Hook for responsive layout logic
const useResponsiveLayout = () => {
     const [viewportWidth, setViewportWidth] = useState(0);
     const [useDoubleColumn, setUseDoubleColumn] = useState(true);
     const fixedCardWidth = 500; // Fixed card width - no scaling
     const fixedCardHeight = 400; // Fixed card height - no scaling

     useEffect(() => {
          const updateLayout = () => {
               const currentWidth = window.innerWidth;

               // Fixed card dimensions - no scaling
               const cardWidth = fixedCardWidth;
               const containerMaxWidth = 1216; // 1152px content + 64px padding
               const containerPadding = 32;
               const cardGap = 48;

               // Calculate available space for cards
               const availableWidth = Math.min(
                    currentWidth - containerPadding * 2,
                    containerMaxWidth - containerPadding * 2
               );
               const requiredWidthForTwoColumns = cardWidth * 2 + cardGap;
               const rotationMargin = cardWidth * 0.1;
               const requiredWidthWithMargin = requiredWidthForTwoColumns + rotationMargin * 2;

               // Determine if we should use double column - switch when two full-size cards don't fit
               const shouldUseDoubleColumn = availableWidth >= requiredWidthWithMargin && currentWidth >= 640;

               setViewportWidth(currentWidth);
               setUseDoubleColumn(shouldUseDoubleColumn);
          };

          updateLayout();
          window.addEventListener("resize", updateLayout);
          return () => window.removeEventListener("resize", updateLayout);
     }, []);

     return { useDoubleColumn, viewportWidth, fixedCardWidth, fixedCardHeight };
};

// Individual Card Component
const HobbiesCardTemplate: React.FC<HobbiesCardProps> = ({ title, imagePath, description, titleFontSize }) => {
     return (
          <div className="hobby-card-asset">
               <div className="hobby-card-header"></div>
               <div
                    className="hobby-card-title"
                    style={{
                         fontFamily: "'Playlist-Script'",
                         fontSize: titleFontSize ? `${titleFontSize}px` : undefined,
                         color: "#2c3e50",
                         textAlign: "center",
                         fontWeight: "normal",
                    }}
               >
                    {title}
               </div>
               <div className="hobby-card-content">
                    <div className="hobby-card-image-placeholder">
                         {imagePath ? (
                              <Image
                                   src={imagePath}
                                   alt={title}
                                   width={400}
                                   height={300}
                                   style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                         ) : (
                              "Image Placeholder"
                         )}
                    </div>
                    <div className="hobby-card-text-placeholder">{description || "Text Placeholder"}</div>
               </div>
          </div>
     );
};

// Container Component with responsive layout
const HobbiesContainer: React.FC<HobbiesContainerProps> = ({ hobbies, showDebugInfo = false }) => {
     const { useDoubleColumn, viewportWidth, fixedCardWidth, fixedCardHeight } = useResponsiveLayout();

     const containerStyle: React.CSSProperties = {
          display: "grid",
          gridTemplateColumns: useDoubleColumn ? "1fr 1fr" : "1fr",
          gap: "3rem",
          maxWidth: "1216px", // 1152px content + 64px padding (2rem * 2)
          margin: "0 auto",
          padding: "2rem",
          alignItems: "center",
          transition: "grid-template-columns 0.3s ease",
     };

     return (
          <>
               {showDebugInfo && (
                    <div
                         style={{
                              position: "fixed",
                              top: "120px",
                              right: "10px",
                              background: "rgba(0,0,0,0.8)",
                              color: "white",
                              padding: "10px",
                              borderRadius: "5px",
                              fontSize: "12px",
                              zIndex: 1000,
                              fontFamily: "monospace",
                         }}
                    >
                         <div>Layout: {useDoubleColumn ? "Double" : "Single"}</div>
                         <div>Cards: Fixed Size</div>
                         <div>Viewport: {viewportWidth}px</div>
                         <div>
                              Card Size: {fixedCardWidth}x{fixedCardHeight}px
                         </div>
                         <div>Required: {(fixedCardWidth * 2 + 48 + fixedCardWidth * 0.2).toFixed(0)}px</div>
                         <div>Available: {Math.min(viewportWidth - 64, 1216 - 64).toFixed(0)}px</div>
                    </div>
               )}
               <div
                    className="hobbies-cards-container-responsive"
                    style={containerStyle}
                    data-layout={useDoubleColumn ? "double-column" : "single-column"}
                    data-card-size={`${fixedCardWidth}x${fixedCardHeight}`}
                    data-viewport-width={viewportWidth}
               >
                    {hobbies.map((hobby, index) => (
                         <HobbiesCardTemplate
                              key={index}
                              title={hobby.title}
                              imagePath={hobby.imagePath || ""}
                              description={hobby.description}
                              titleFontSize={hobby.titleFontSize}
                         />
                    ))}
               </div>
          </>
     );
};

export default HobbiesCardTemplate;
export { HobbiesContainer };
export type { HobbyCardData };

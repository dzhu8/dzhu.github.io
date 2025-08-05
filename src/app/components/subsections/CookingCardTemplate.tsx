"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCardTransform, getCardHoverTransform } from "../../utils/cardRotation";

interface CookingCardProps {
     title: string;
     imagePath: string;
     description?: string;
     titleFontSize?: number; // Font size in pixels, defaults to responsive sizing
     index: number; // Add index for rotation calculation
}

interface CookingCardData {
     title: string;
     imagePath?: string;
     description?: string;
     titleFontSize?: number;
}

interface CookingContainerProps {
     recipes: CookingCardData[];
     showDebugInfo?: boolean;
}

// Hook for responsive layout logic
const useResponsiveLayout = () => {
     const [viewportWidth, setViewportWidth] = useState(0);
     const [useDoubleColumn, setUseDoubleColumn] = useState(true);
     const fixedCardWidth = 500; // Fixed card width - no scaling
     const fixedCardHeight = 360; // Fixed card height - no scaling

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
const CookingCardTemplate: React.FC<CookingCardProps> = ({ title, imagePath, description, titleFontSize, index }) => {
     const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
     const [imageError, setImageError] = useState(false);
     const [isHovered, setIsHovered] = useState(false);

     // Handle image load to get natural dimensions
     const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
          const img = event.currentTarget;
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;

          // Card dimensions (fixed at 500x360px)
          const cardWidth = 500;
          const cardHeight = 360;

          // 45% requirements
          const minWidth = cardWidth * 0.4; // 40% of card width = 200px
          const minHeight = cardHeight * 0.45; // 45% of card height = 162px

          let finalWidth = naturalWidth;
          let finalHeight = naturalHeight;

          // Check if both dimensions are less than 40% - need to scale up
          if (naturalWidth < minWidth && naturalHeight < minHeight) {
               const scaleForWidth = minWidth / naturalWidth;
               const scaleForHeight = minHeight / naturalHeight;
               // Use the larger scale to ensure both minimums are met
               const scaleUp = Math.max(scaleForWidth, scaleForHeight);
               finalWidth = Math.round(naturalWidth * scaleUp);
               finalHeight = Math.round(naturalHeight * scaleUp);
          }
          // Check if both dimensions are greater than 40% - need to scale down to smallest possible
          else if (naturalWidth > minWidth && naturalHeight > minHeight) {
               const scaleForWidth = minWidth / naturalWidth;
               const scaleForHeight = minHeight / naturalHeight;
               // Use the larger scale (closer to 1) to get the smallest possible values that still meet requirements
               const scaleDown = Math.max(scaleForWidth, scaleForHeight);
               finalWidth = Math.round(naturalWidth * scaleDown);
               finalHeight = Math.round(naturalHeight * scaleDown);
          }
          // Otherwise, use original dimensions (one dimension meets requirement, other doesn't - no scaling)

          setImageDimensions({ width: finalWidth, height: finalHeight });
     };

     const handleImageError = () => {
          setImageError(true);
          // Fallback dimensions meeting 45% requirement
          const cardWidth = 500;
          const cardHeight = 360;
          const fallbackWidth = Math.round(cardWidth * 0.4); // 40% of card width
          const fallbackHeight = Math.round(cardHeight * 0.45); // 45% of card height
          setImageDimensions({ width: fallbackWidth, height: fallbackHeight });
     };

     return (
          <div
               className="hobby-card-asset"
               style={{
                    position: "relative",
                    transform: isHovered ? getCardHoverTransform(index) : getCardTransform(index),
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
               }}
               onMouseEnter={() => setIsHovered(true)}
               onMouseLeave={() => setIsHovered(false)}
          >
               <div className="cooking-card-header"></div>
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
               <div className="hobby-card-content-wrapped">
                    <div className="hobby-card-text-container">
                         <div
                              className="hobby-card-image-wrapped"
                              style={{
                                   width: imageDimensions ? `${imageDimensions.width}px` : "200px", // 40% of 500px card width
                                   height: imageDimensions ? `${imageDimensions.height}px` : "162px", // 45% of 360px card height
                              }}
                         >
                              {imagePath && !imageError ? (
                                   <Image
                                        src={imagePath}
                                        alt={title}
                                        width={400}
                                        height={300}
                                        style={{
                                             width: "100%",
                                             height: "100%",
                                             objectFit: "cover",
                                             borderRadius: "6px",
                                        }}
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                   />
                              ) : (
                                   "Recipe Image Placeholder"
                              )}
                         </div>
                         {description || "Recipe Description"}
                    </div>
               </div>
          </div>
     );
};

// Container Component with responsive layout
const CookingContainer: React.FC<CookingContainerProps> = ({ recipes, showDebugInfo = false }) => {
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
                    className="hobby-cards-container-responsive"
                    style={containerStyle}
                    data-layout={useDoubleColumn ? "double-column" : "single-column"}
                    data-card-size={`${fixedCardWidth}x${fixedCardHeight}`}
                    data-viewport-width={viewportWidth}
               >
                    {recipes.map((recipe, index) => (
                         <CookingCardTemplate
                              key={index}
                              title={recipe.title}
                              imagePath={recipe.imagePath || ""}
                              description={recipe.description}
                              titleFontSize={recipe.titleFontSize}
                              index={index}
                         />
                    ))}
               </div>
          </>
     );
};

export default CookingCardTemplate;
export { CookingContainer };
export type { CookingCardData };

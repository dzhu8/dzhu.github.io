"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCardTransform, getCardHoverTransform } from "../../utils/cardRotation";

interface BakingCardProps {
     title: string;
     imagePath: string;
     description?: string;
     titleFontSize?: number; // Font size in pixels, defaults to responsive sizing
     index: number; // Add index for rotation calculation
     cardDimensions: { width: number; height: number };
     useVerticalLayout: boolean;
}

interface BakingCardData {
     title: string;
     imagePath?: string;
     description?: string;
     titleFontSize?: number;
}

interface BakingContainerProps {
     recipes: BakingCardData[];
     showDebugInfo?: boolean;
}

// Hook for responsive layout logic
const useResponsiveLayout = () => {
     const [viewportWidth, setViewportWidth] = useState(0);
     const [useDoubleColumn, setUseDoubleColumn] = useState(true);
     const [cardDimensions, setCardDimensions] = useState({ width: 500, height: 360 });
     const [useVerticalLayout, setUseVerticalLayout] = useState(false);

     useEffect(() => {
          const updateLayout = () => {
               const currentWidth = window.innerWidth;
               const containerMaxWidth = 1216; // 1152px content + 64px padding
               const containerPadding = 32;
               const cardGap = 48;
               const minCardWidth = 100;

               // Calculate available space for cards
               const availableWidth = Math.min(
                    currentWidth - containerPadding * 2,
                    containerMaxWidth - containerPadding * 2
               );

               // Determine card scaling
               let cardWidth = 500; // Default card width
               let cardHeight = 360; // Default card height
               let shouldUseVerticalLayout = false;
               
               // Check if we need to scale down cards
               if (availableWidth < 500 + 100) { // If less than one card + margin
                    cardWidth = Math.max(availableWidth - 100, minCardWidth);
                    cardHeight = Math.round(cardWidth * 0.72); // Maintain aspect ratio
                    shouldUseVerticalLayout = cardWidth < 300; // Use vertical layout for very small cards
               }

               const rotationMargin = cardWidth * 0.1;
               const requiredWidthForTwoColumns = cardWidth * 2 + cardGap + rotationMargin * 2;

               // Determine if we should use double column
               const shouldUseDoubleColumn = availableWidth >= requiredWidthForTwoColumns && currentWidth >= 640 && !shouldUseVerticalLayout;

               setViewportWidth(currentWidth);
               setUseDoubleColumn(shouldUseDoubleColumn);
               setCardDimensions({ width: cardWidth, height: cardHeight });
               setUseVerticalLayout(shouldUseVerticalLayout);
          };

          updateLayout();
          window.addEventListener("resize", updateLayout);
          return () => window.removeEventListener("resize", updateLayout);
     }, []);

     return { useDoubleColumn, viewportWidth, cardDimensions, useVerticalLayout };
};

// Individual Card Component
const BakingCardTemplate: React.FC<BakingCardProps> = ({ title, imagePath, description, titleFontSize, index, cardDimensions, useVerticalLayout }) => {
     const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
     const [imageError, setImageError] = useState(false);
     const [isHovered, setIsHovered] = useState(false);

     // Handle image load to get natural dimensions
     const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
          const img = event.currentTarget;
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;

          // Use dynamic card dimensions
          const cardWidth = cardDimensions.width;
          const cardHeight = cardDimensions.height;

          // Calculate minimum dimensions based on layout
          let minWidth, minHeight;
          if (useVerticalLayout) {
               // For vertical layout, image can be smaller relative to card
               minWidth = cardWidth * 0.6; // 60% of card width
               minHeight = cardHeight * 0.3; // 30% of card height
          } else {
               // Original horizontal layout requirements
               minWidth = cardWidth * 0.4; // 40% of card width
               minHeight = cardHeight * 0.45; // 45% of card height
          }

          let finalWidth = naturalWidth;
          let finalHeight = naturalHeight;

          // Check if both dimensions are less than minimum - need to scale up
          if (naturalWidth < minWidth && naturalHeight < minHeight) {
               const scaleForWidth = minWidth / naturalWidth;
               const scaleForHeight = minHeight / naturalHeight;
               const scaleUp = Math.max(scaleForWidth, scaleForHeight);
               finalWidth = Math.round(naturalWidth * scaleUp);
               finalHeight = Math.round(naturalHeight * scaleUp);
          }
          // Check if both dimensions are greater than minimum - need to scale down
          else if (naturalWidth > minWidth && naturalHeight > minHeight) {
               const scaleForWidth = minWidth / naturalWidth;
               const scaleForHeight = minHeight / naturalHeight;
               const scaleDown = Math.max(scaleForWidth, scaleForHeight);
               finalWidth = Math.round(naturalWidth * scaleDown);
               finalHeight = Math.round(naturalHeight * scaleDown);
          }

          setImageDimensions({ width: finalWidth, height: finalHeight });
     };

     const handleImageError = () => {
          setImageError(true);
          // Fallback dimensions
          const cardWidth = cardDimensions.width;
          const cardHeight = cardDimensions.height;
          const fallbackWidth = Math.round(cardWidth * (useVerticalLayout ? 0.6 : 0.4));
          const fallbackHeight = Math.round(cardHeight * (useVerticalLayout ? 0.3 : 0.45));
          setImageDimensions({ width: fallbackWidth, height: fallbackHeight });
     };

     // Calculate responsive font size
     const responsiveFontSize = titleFontSize || Math.max(16, cardDimensions.width * 0.05);

     return (
          <div
               className="hobby-card-asset"
               style={{
                    position: "relative",
                    transform: isHovered ? getCardHoverTransform(index) : getCardTransform(index),
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    width: `${cardDimensions.width}px`,
                    height: useVerticalLayout ? 'auto' : `${cardDimensions.height}px`,
                    minHeight: useVerticalLayout ? `${cardDimensions.height}px` : undefined,
               }}
               onMouseEnter={() => setIsHovered(true)}
               onMouseLeave={() => setIsHovered(false)}
          >
               <div className="baking-card-header"></div>
               <div
                    className="hobby-card-title"
                    style={{
                         fontFamily: "'Playlist-Script'",
                         fontSize: `${responsiveFontSize}px`,
                         color: "#2c3e50",
                         textAlign: "center",
                         fontWeight: "normal",
                    }}
               >
                    {title}
               </div>
               <div className="hobby-card-content-wrapped">
                    <div className={`hobby-card-text-container ${useVerticalLayout ? 'vertical-layout' : ''}`}>
                         <div
                              className="hobby-card-image-wrapped"
                              style={{
                                   width: imageDimensions ? `${imageDimensions.width}px` : `${Math.round(cardDimensions.width * (useVerticalLayout ? 0.6 : 0.4))}px`,
                                   height: imageDimensions ? `${imageDimensions.height}px` : `${Math.round(cardDimensions.height * (useVerticalLayout ? 0.3 : 0.45))}px`,
                                   margin: useVerticalLayout ? '0 auto 1rem auto' : undefined,
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
                         <div style={{
                              fontSize: `${Math.max(12, cardDimensions.width * 0.03)}px`,
                              lineHeight: '1.4',
                              textAlign: useVerticalLayout ? 'center' : 'left',
                         }}>
                              {description || "Recipe Description"}
                         </div>
                    </div>
               </div>
          </div>
     );
};

// Container Component with responsive layout
const BakingContainer: React.FC<BakingContainerProps> = ({ recipes, showDebugInfo = false }) => {
     const { useDoubleColumn, viewportWidth, cardDimensions, useVerticalLayout } = useResponsiveLayout();

     const containerStyle: React.CSSProperties = {
          display: "grid",
          gridTemplateColumns: useDoubleColumn ? "1fr 1fr" : "1fr",
          gap: "3rem",
          maxWidth: "1216px", // 1152px content + 64px padding (2rem * 2)
          margin: "0 auto",
          padding: "4px",
          alignItems: useVerticalLayout ? "start" : "center",
          justifyItems: "center", // Center cards horizontally
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
                         <div>Orientation: {useVerticalLayout ? "Vertical" : "Horizontal"}</div>
                         <div>Viewport: {viewportWidth}px</div>
                         <div>
                              Card Size: {cardDimensions.width}x{cardDimensions.height}px
                         </div>
                         <div>Required: {(cardDimensions.width * 2 + 48 + cardDimensions.width * 0.2).toFixed(0)}px</div>
                         <div>Available: {Math.min(viewportWidth - 64, 1216 - 64).toFixed(0)}px</div>
                    </div>
               )}
               <div
                    className="hobby-cards-container-responsive"
                    style={containerStyle}
                    data-layout={useDoubleColumn ? "double-column" : "single-column"}
                    data-orientation={useVerticalLayout ? "vertical" : "horizontal"}
                    data-card-size={`${cardDimensions.width}x${cardDimensions.height}`}
                    data-viewport-width={viewportWidth}
               >
                    {recipes.map((recipe, index) => (
                         <BakingCardTemplate
                              key={index}
                              title={recipe.title}
                              imagePath={recipe.imagePath || ""}
                              description={recipe.description}
                              titleFontSize={recipe.titleFontSize}
                              index={index}
                              cardDimensions={cardDimensions}
                              useVerticalLayout={useVerticalLayout}
                         />
                    ))}
               </div>
          </>
     );
};

export default BakingCardTemplate;
export { BakingContainer };
export type { BakingCardData };

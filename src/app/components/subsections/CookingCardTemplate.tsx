"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getCardTransform, getCardHoverTransform } from "../../utils/cardRotation";

interface CookingCardProps {
     title: string;
     imagePath: string;
     description?: string;
     titleFontSize?: number; // Font size in pixels, defaults to responsive sizing
     index: number; // Add index for rotation calculation
     cardDimensions: { width: number; height: number };
     useVerticalLayout: boolean;
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
const CookingCardTemplate: React.FC<CookingCardProps> = ({ title, imagePath, description, titleFontSize, index, cardDimensions, useVerticalLayout }) => {
     const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
     const [imageError, setImageError] = useState(false);
     const [isHovered, setIsHovered] = useState(false);
     const [useHoverText, setUseHoverText] = useState(false);
     const [dynamicCardHeight, setDynamicCardHeight] = useState(cardDimensions.height);
     const [naturalImageDimensions, setNaturalImageDimensions] = useState<{ width: number; height: number } | null>(null);

     // Separate function to calculate image layout
     const calculateImageLayout = useCallback((naturalWidth: number, naturalHeight: number) => {
          const cardWidth = cardDimensions.width;
          const cardHeight = cardDimensions.height;

          // Determine if we should use hover text based on card width
          const shouldUseHoverText = cardWidth < 350;
          setUseHoverText(shouldUseHoverText);

          // Calculate image dimensions
          let finalImageWidth, finalImageHeight;
          
          if (useVerticalLayout || shouldUseHoverText) {
               // For vertical layout or hover text mode, image can take more space
               const maxImageWidth = cardWidth * 0.9; // 90% of card width
               
               // Calculate available height for image (total card height minus fixed elements)
               const titleHeight = 60;
               const headerHeight = 80;
               const padding = 40;
               const textHeight = shouldUseHoverText ? 0 : 60; // No text space when using hover
               const availableImageHeight = Math.max(cardHeight - headerHeight - titleHeight - textHeight - padding, 120);
               
               // Scale image to fit within max dimensions while maintaining aspect ratio
               const imageAspectRatio = naturalWidth / naturalHeight;
               const maxAspectRatio = maxImageWidth / availableImageHeight;
               
               if (imageAspectRatio > maxAspectRatio) {
                    // Image is wider - constrain by width
                    finalImageWidth = maxImageWidth;
                    finalImageHeight = maxImageWidth / imageAspectRatio;
               } else {
                    // Image is taller - constrain by height
                    finalImageHeight = availableImageHeight;
                    finalImageWidth = availableImageHeight * imageAspectRatio;
               }
          } else {
               // Original horizontal layout requirements
               const minWidth = cardWidth * 0.4; // 40% of card width
               const minHeight = cardHeight * 0.45; // 45% of card height
               
               finalImageWidth = naturalWidth;
               finalImageHeight = naturalHeight;

               // Check if both dimensions are less than minimum - need to scale up
               if (naturalWidth < minWidth && naturalHeight < minHeight) {
                    const scaleForWidth = minWidth / naturalWidth;
                    const scaleForHeight = minHeight / naturalHeight;
                    const scaleUp = Math.max(scaleForWidth, scaleForHeight);
                    finalImageWidth = Math.round(naturalWidth * scaleUp);
                    finalImageHeight = Math.round(naturalHeight * scaleUp);
               }
               // Check if both dimensions are greater than minimum - need to scale down
               else if (naturalWidth > minWidth && naturalHeight > minHeight) {
                    const scaleForWidth = minWidth / naturalWidth;
                    const scaleForHeight = minHeight / naturalHeight;
                    const scaleDown = Math.max(scaleForWidth, scaleForHeight);
                    finalImageWidth = Math.round(naturalWidth * scaleDown);
                    finalImageHeight = Math.round(naturalHeight * scaleDown);
               }
          }

          setImageDimensions({ width: Math.round(finalImageWidth), height: Math.round(finalImageHeight) });

          // Calculate dynamic card height based on content
          if (shouldUseHoverText || useVerticalLayout) {
               const titleHeight = 60;
               const headerHeight = 80;
               const padding = 40;
               const imageHeight = Math.round(finalImageHeight);
               const textHeight = shouldUseHoverText ? 0 : 60;
               
               const calculatedHeight = headerHeight + titleHeight + imageHeight + textHeight + padding;
               const minCardHeight = 300;
               setDynamicCardHeight(Math.max(calculatedHeight, minCardHeight));
          } else {
               setDynamicCardHeight(cardDimensions.height);
          }
     }, [cardDimensions, useVerticalLayout]);

     // Recalculate layout when card dimensions change
     useEffect(() => {
          if (naturalImageDimensions) {
               calculateImageLayout(naturalImageDimensions.width, naturalImageDimensions.height);
          } else {
               // Recalculate hover text mode based on current card width
               const shouldUseHoverText = cardDimensions.width < 350;
               setUseHoverText(shouldUseHoverText);
               
               // Recalculate dynamic height even without natural image dimensions
               if (shouldUseHoverText || useVerticalLayout) {
                    const titleHeight = 60;
                    const headerHeight = 80;
                    const padding = 40;
                    const fallbackImageHeight = Math.round(cardDimensions.height * 0.4);
                    const textHeight = shouldUseHoverText ? 0 : 60;
                    
                    const calculatedHeight = headerHeight + titleHeight + fallbackImageHeight + textHeight + padding;
                    setDynamicCardHeight(Math.max(calculatedHeight, 300));
               } else {
                    setDynamicCardHeight(cardDimensions.height);
               }
          }
     }, [cardDimensions, useVerticalLayout, naturalImageDimensions, calculateImageLayout]);

     // Handle image load to get natural dimensions
     const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
          const img = event.currentTarget;
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;

          // Store natural dimensions for recalculation when card dimensions change
          setNaturalImageDimensions({ width: naturalWidth, height: naturalHeight });
          
          // Calculate layout with natural dimensions
          calculateImageLayout(naturalWidth, naturalHeight);
     };

     const handleImageError = () => {
          setImageError(true);
          setNaturalImageDimensions(null); // Clear natural dimensions on error
          
          // Fallback dimensions
          const cardWidth = cardDimensions.width;
          const cardHeight = cardDimensions.height;
          const shouldUseHoverText = cardWidth < 350;
          setUseHoverText(shouldUseHoverText);
          
          let fallbackWidth, fallbackHeight;
          if (useVerticalLayout || shouldUseHoverText) {
               fallbackWidth = Math.round(cardWidth * 0.8);
               fallbackHeight = Math.round(cardHeight * 0.4);
          } else {
               fallbackWidth = Math.round(cardWidth * 0.4);
               fallbackHeight = Math.round(cardHeight * 0.45);
          }
          
          setImageDimensions({ width: fallbackWidth, height: fallbackHeight });
          
          // Set dynamic card height for error case too
          if (shouldUseHoverText || useVerticalLayout) {
               const calculatedHeight = 80 + 60 + fallbackHeight + 40; // header + title + image + padding
               setDynamicCardHeight(Math.max(calculatedHeight, 300));
          } else {
               setDynamicCardHeight(cardDimensions.height);
          }
     };

     // Calculate responsive font size
     const responsiveFontSize = titleFontSize || Math.max(16, cardDimensions.width * 0.05);

     return (
          <div
               className="hobby-card-asset"
               style={{
                    position: "relative",
                    transform: isHovered ? getCardHoverTransform(index) : getCardTransform(index),
                    transition: "transform 0.3s ease, box-shadow 0.3s ease, height 0.3s ease",
                    width: `${cardDimensions.width}px`,
                    height: `${dynamicCardHeight}px`,
               }}
               onMouseEnter={() => setIsHovered(true)}
               onMouseLeave={() => setIsHovered(false)}
          >
               <div className="cooking-card-header"></div>
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
                    <div className={`hobby-card-text-container ${useVerticalLayout ? 'vertical-layout' : ''} ${useHoverText ? 'hover-text-mode' : ''}`}>
                         <div
                              className="hobby-card-image-wrapped"
                              style={{
                                   width: imageDimensions ? `${imageDimensions.width}px` : `${Math.round(cardDimensions.width * (useVerticalLayout || useHoverText ? 0.8 : 0.4))}px`,
                                   height: imageDimensions ? `${imageDimensions.height}px` : `${Math.round(cardDimensions.height * (useVerticalLayout || useHoverText ? 0.4 : 0.45))}px`,
                                   margin: (useVerticalLayout || useHoverText) ? '0 auto 1rem auto' : undefined,
                                   position: 'relative',
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
                              
                              {/* Hover text overlay for narrow cards */}
                              {useHoverText && description && (
                                   <div
                                        style={{
                                             position: 'absolute',
                                             top: 0,
                                             left: 0,
                                             right: 0,
                                             bottom: 0,
                                             background: 'rgba(0, 0, 0, 0.8)',
                                             color: 'white',
                                             padding: '12px',
                                             borderRadius: '6px',
                                             display: 'flex',
                                             alignItems: 'center',
                                             justifyContent: 'center',
                                             textAlign: 'center',
                                             fontSize: `${Math.max(11, cardDimensions.width * 0.025)}px`,
                                             lineHeight: '1.3',
                                             opacity: isHovered ? 1 : 0,
                                             transition: 'opacity 0.3s ease',
                                             pointerEvents: isHovered ? 'auto' : 'none',
                                        }}
                                   >
                                        {description}
                                   </div>
                              )}
                         </div>
                         
                         {/* Regular text display for wider cards */}
                         {!useHoverText && (
                              <div style={{
                                   fontSize: `${Math.max(12, cardDimensions.width * 0.03)}px`,
                                   lineHeight: '1.4',
                                   textAlign: useVerticalLayout ? 'center' : 'left',
                              }}>
                                   {description || "Recipe Description"}
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
};

// Container Component with responsive layout
const CookingContainer: React.FC<CookingContainerProps> = ({ recipes, showDebugInfo = false }) => {
     const { useDoubleColumn, viewportWidth, cardDimensions, useVerticalLayout } = useResponsiveLayout();

     const containerStyle: React.CSSProperties = {
          display: "grid",
          gridTemplateColumns: useDoubleColumn ? "1fr 1fr" : "1fr",
          gap: "3rem",
          maxWidth: "1216px", // 1152px content + 64px padding (2rem * 2)
          margin: "0 auto",
          padding: "4px",
          alignItems: "start", // Always align to start since cards have dynamic heights
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
                         <div>Cards: Fixed Size</div>
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
                    data-card-size={`${cardDimensions.width}x${cardDimensions.height}`}
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
                              cardDimensions={cardDimensions}
                              useVerticalLayout={useVerticalLayout}
                         />
                    ))}
               </div>
          </>
     );
};

export default CookingCardTemplate;
export { CookingContainer };
export type { CookingCardData };

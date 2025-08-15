import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface NewsArticleLayoutProps {
     title?: string;
     date?: string;
     journal?: string;
     imagePath?: string;
     imageAlt?: string;
     pdfPath?: string;
     githubUrl?: string;
     url?: string; // URL for social sharing
     fullText?: string; // Combined main and secondary content
     article1Title?: string;
     article1Content?: string;
     article1PdfPath?: string;
     article2Title?: string;
     article2Content?: string;
     article2PdfPath?: string;
     // Numeric font sizes
     mainContentFontSize?: number;
     secondaryContentFontSize?: number;
     article1ContentFontSize?: number;
     article2ContentFontSize?: number;
}

const NewsArticleLayout: React.FC<NewsArticleLayoutProps> = ({
     title = "Title",
     date = "Date",
     journal,
     imagePath = "/Spateo.png",
     imageAlt = "Article image",
     pdfPath,
     githubUrl,
     url, // URL for social sharing
     fullText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel justo eu nibh vestibulum tincidunt. Praesent faucibus, nisl in lobortis tincidunt, magna lacus pulvinar mauris, nec accumsan odio metus et dolor. Cras non nisi ut augue pulvinar luctus. Curabitur eget augue ut turpis feugiat finibus eget sed nibh. Duis fermentum, tortor vel dictum lobortis, arcu nisi condimentum eros, vel ullamcorper risus dolor eget nisl. Praesent sodales nibh at euismod mattis. Sed dignissim, tortor sed finibus pellentesque, felis dolor scelerisque massa, eget tincidunt libero magna sit amet risus.",
     article1Title = "Title",
     article1Content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel justo eu nibh vestibulum tincidunt. Praesent faucibus, nisl in lobortis tincidunt, magna lacus pulvinar mauris.",
     article1PdfPath,
     article2Title = "Title",
     article2Content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel justo eu nibh vestibulum tincidunt. Praesent faucibus, nisl in lobortis tincidunt, magna lacus pulvinar mauris.",
     article2PdfPath,
     // Default font sizes in pixels
     mainContentFontSize = 16,
     secondaryContentFontSize = 16,
     article1ContentFontSize = 16,
     article2ContentFontSize = 16,
}) => {
     const [mainContent, setMainContent] = useState("");
     const [secondaryContent, setSecondaryContent] = useState("");
     const [currentUrl, setCurrentUrl] = useState<string>("");
     const [isMobile, setIsMobile] = useState(false);

     // Refs for measuring header heights
     const article1HeaderRef = useRef<HTMLDivElement>(null);
     const article2HeaderRef = useRef<HTMLDivElement>(null);
     const [headerHeight, setHeaderHeight] = useState<number | null>(null);

     // Refs for text measurement
     const measurementRef = useRef<HTMLDivElement>(null);
     const leftColumnRef = useRef<HTMLDivElement>(null);
     const rightColumnRef = useRef<HTMLDivElement>(null);

     // Check if mobile viewport
     useEffect(() => {
          const checkMobile = () => {
               setIsMobile(window.innerWidth < 768);
          };
          
          checkMobile();
          window.addEventListener("resize", checkMobile);
          
          return () => window.removeEventListener("resize", checkMobile);
     }, []);

     // Get current URL on client side
     useEffect(() => {
          if (typeof window !== "undefined") {
               setCurrentUrl(window.location.href);
          }
     }, []);

     // Ensure consistent header height
     useEffect(() => {
          const calculateHeaderHeight = () => {
               if (article1HeaderRef.current && article2HeaderRef.current) {
                    // Reset height to auto to get natural height
                    article1HeaderRef.current.style.minHeight = "auto";
                    article2HeaderRef.current.style.minHeight = "auto";

                    // Get natural heights
                    const height1 = article1HeaderRef.current.offsetHeight;
                    const height2 = article2HeaderRef.current.offsetHeight;
                    const maxHeight = Math.max(height1, height2);

                    // Add padding to prevent overlap - scale with font size
                    const scaleFactor = Math.max(mainContentFontSize / 16, 0.5); // Minimum 0.5x scale
                    const paddedHeight = maxHeight + 20 * scaleFactor; // 20px base padding scaled

                    setHeaderHeight(paddedHeight);
               }
          };

          // Use requestAnimationFrame to ensure DOM is updated
          const timer = requestAnimationFrame(() => {
               setTimeout(calculateHeaderHeight, 50);
          });

          window.addEventListener("resize", calculateHeaderHeight);

          return () => {
               cancelAnimationFrame(timer);
               window.removeEventListener("resize", calculateHeaderHeight);
          };
     }, [article1Title, article2Title, article1PdfPath, article2PdfPath, mainContentFontSize]);

     // Smart text splitting function
     const calculateOptimalSplit = React.useCallback(() => {
          if (!fullText || !leftColumnRef.current || !rightColumnRef.current) return;

          // On mobile, don't split the text - use full text in one column
          if (isMobile) {
               setMainContent(fullText);
               setSecondaryContent("");
               return;
          }

          const words = fullText.split(" ");
          const totalWords = words.length;

          // Get column dimensions
          const leftColumnWidth = leftColumnRef.current.clientWidth;
          const rightColumnWidth = rightColumnRef.current.clientWidth;

          // Use binary search to find optimal split point
          let left = 0;
          let right = totalWords;
          let bestSplit = Math.floor(totalWords / 2);
          let bestHeightDifference = Infinity;

          // Create temporary measurement element
          const tempElement = document.createElement("div");
          tempElement.style.position = "absolute";
          tempElement.style.visibility = "hidden";
          tempElement.style.fontSize = `${mainContentFontSize}px`;
          tempElement.style.fontFamily = getComputedStyle(leftColumnRef.current).fontFamily;
          tempElement.style.lineHeight = getComputedStyle(leftColumnRef.current).lineHeight;
          tempElement.style.padding = "0.5rem";
          document.body.appendChild(tempElement);

          while (left <= right) {
               const mid = Math.floor((left + right) / 2);
               const leftText = words.slice(0, mid).join(" ");
               const rightText = words.slice(mid).join(" ");

               // Measure left column height
               tempElement.style.width = `${leftColumnWidth}px`;
               tempElement.innerHTML = `<span style="float:left; font-size:4.5rem; line-height:1; margin-right:0.5rem; margin-top:0.25rem;">${leftText.charAt(0)}</span>${leftText.substring(1)}`;
               const leftTextHeight = tempElement.scrollHeight;

               // Measure right column height
               tempElement.style.width = `${rightColumnWidth}px`;
               tempElement.innerHTML = rightText;
               const rightTextHeight = tempElement.scrollHeight;

               const heightDifference = Math.abs(leftTextHeight - rightTextHeight);

               if (heightDifference < bestHeightDifference) {
                    bestHeightDifference = heightDifference;
                    bestSplit = mid;
               }

               // Adjust search based on which column is taller
               if (leftTextHeight > rightTextHeight) {
                    right = mid - 1;
               } else {
                    left = mid + 1;
               }

               // Break if we've found a very good split
               if (heightDifference < 10) break;
          }

          document.body.removeChild(tempElement);

          // Set the split content
          const splitMainContent = words.slice(0, bestSplit).join(" ");
          const splitSecondaryContent = words.slice(bestSplit).join(" ");

          setMainContent(splitMainContent);
          setSecondaryContent(splitSecondaryContent);
     }, [fullText, mainContentFontSize, isMobile]);

     // Calculate split when component mounts and on resize
     useEffect(() => {
          const timer = setTimeout(() => {
               calculateOptimalSplit();
          }, 100); // Small delay to ensure elements are rendered

          const handleResize = () => {
               setTimeout(calculateOptimalSplit, 100);
          };

          window.addEventListener("resize", handleResize);

          return () => {
               clearTimeout(timer);
               window.removeEventListener("resize", handleResize);
          };
     }, [calculateOptimalSplit]);

     // Get the first letter of the main content for the drop cap
     const firstLetter = mainContent.charAt(0);
     const restOfContent = mainContent.substring(1);

     // Use custom URL if provided, otherwise fall back to current URL
     const shareUrl = url || currentUrl;

     // Calculate responsive font sizes
     const responsiveMainFontSize = isMobile ? Math.max(mainContentFontSize * 0.9, 14) : mainContentFontSize;
     const responsiveSecondaryFontSize = isMobile ? Math.max(secondaryContentFontSize * 0.9, 14) : secondaryContentFontSize;
     //const responsiveArticle1FontSize = isMobile ? Math.max(article1ContentFontSize * 0.85, 12) : article1ContentFontSize;
     //const responsiveArticle2FontSize = isMobile ? Math.max(article2ContentFontSize * 0.85, 12) : article2ContentFontSize;

     return (
          <div className="max-w-6xl mx-auto p-3 sm:p-6">
               {/* Header Section */}
               <div className="mb-6 p-2 text-center">
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight px-2">
                         {title}
                    </h1>

                    {/* Date and Journal - directly below title */}
                    <div className="mt-2 mb-4">
                         <span className="text-lg sm:text-xl">{date}</span>
                         {journal && (
                              <>
                                   <span className="text-lg sm:text-xl">, </span>
                                   <span className="text-lg sm:text-xl italic">{journal}</span>
                              </>
                         )}
                    </div>

                    {/* Action Buttons Row - centered */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
                         {/* PDF Download Button - only shown if pdfPath is provided */}
                         {pdfPath && (
                              <Link href={pdfPath} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                   <button className="w-full sm:w-auto flex items-center justify-center px-3 sm:px-4 py-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors text-sm sm:text-base">
                                        <Image
                                             src="/PDF_file_icon.svg"
                                             alt="PDF"
                                             width={16}
                                             height={16}
                                             className="mr-2 flex-shrink-0"
                                        />
                                        <span className="whitespace-nowrap">Download PDF</span>
                                   </button>
                              </Link>
                         )}

                         {/* GitHub Button - only shown if githubUrl is provided */}
                         {githubUrl && (
                              <Link href={githubUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                   <button className="w-full sm:w-auto flex items-center justify-center px-3 sm:px-4 py-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors text-sm sm:text-base">
                                        <Image
                                             src="/Octicons-mark-github.svg"
                                             alt="GitHub"
                                             width={16}
                                             height={16}
                                             className="mr-2 flex-shrink-0"
                                        />
                                        <span className="whitespace-nowrap">View on GitHub</span>
                                   </button>
                              </Link>
                         )}
                    </div>
               </div>

               {/* Share Section */}
               <div className="flex justify-center mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                         <span className="text-sm sm:text-base whitespace-nowrap">Share:</span>
                         <div className="flex space-x-2">
                              {/* LinkedIn */}
                              <a
                                   href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-800 flex items-center justify-center hover:bg-violet-700 transition-colors flex-shrink-0"
                              >
                                   <Image src="/LinkedIn_icon.svg" alt="Share on LinkedIn" width={16} height={16} className="sm:w-5 sm:h-5" />
                              </a>

                              {/* X (Twitter) */}
                              <a
                                   href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-800 flex items-center justify-center hover:bg-violet-700 transition-colors flex-shrink-0"
                              >
                                   <Image src="/X_icon.svg" alt="Share on X" width={14} height={14} className="sm:w-4 sm:h-4 invert" />
                              </a>

                              {/* Bluesky */}
                              <a
                                   href={`https://bsky.app/intent/compose?text=${encodeURIComponent(title + " " + shareUrl)}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-800 flex items-center justify-center hover:bg-violet-700 transition-colors flex-shrink-0"
                              >
                                   <Image src="/Bluesky_icon.svg" alt="Share on Bluesky" width={14} height={14} className="sm:w-4 sm:h-4" />
                              </a>

                              {/* Reddit */}
                              <a
                                   href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-800 flex items-center justify-center hover:bg-violet-700 transition-colors flex-shrink-0"
                              >
                                   <Image src="/reddit_icon.svg" alt="Share on Reddit" width={16} height={16} className="sm:w-5 sm:h-5" />
                              </a>
                         </div>
                    </div>
               </div>

               {/* Main content */}
               <div className="flex flex-col md:flex-row mb-6 gap-4 md:gap-0">
                    {/* Image container */}
                    <div className="w-full md:w-1/3 mb-4 md:mb-0">
                         <div className="bg-blue-800 h-64 sm:h-80 md:h-96 flex items-center justify-center text-white overflow-hidden">
                              <Image
                                   src={imagePath}
                                   alt={imageAlt}
                                   width={400}
                                   height={400}
                                   style={{ objectFit: "cover", width: "100%", height: "100%" }}
                              />
                         </div>
                    </div>

                    {/* Text columns */}
                    <div className="w-full md:w-2/3 md:pl-6">
                         <div className={`${isMobile ? 'block' : 'grid grid-cols-2 gap-8'} h-full`}>
                              {/* Left column with drop cap */}
                              <div ref={leftColumnRef} className="p-2">
                                   <p className="text-justify">
                                        {firstLetter && !isMobile && (
                                             <span className="float-left text-5xl sm:text-6xl md:text-7xl font-serif mr-2 mt-1 leading-none">
                                                  {firstLetter}
                                             </span>
                                        )}
                                        <span style={{ fontSize: `${responsiveMainFontSize}px` }}>
                                             {isMobile ? mainContent : restOfContent}
                                        </span>
                                   </p>
                              </div>

                              {/* Right column - Hidden on mobile */}
                              {!isMobile && (
                                   <div ref={rightColumnRef} className="p-2">
                                        <p className="text-justify" style={{ fontSize: `${responsiveSecondaryFontSize}px` }}>
                                             {secondaryContent}
                                        </p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Bottom text boxes */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
                    {/* Left text box */}
                    <div className="flex flex-col min-h-0 border-2 border-gray-400 rounded-lg overflow-hidden shadow-sm">
                         <div
                              ref={article1HeaderRef}
                              className="flex-shrink-0 p-3 md:p-4 bg-gray-100 border-b-2 border-gray-400"
                              style={{
                                   minHeight: headerHeight ? `${headerHeight}px` : "auto",
                                   display: "flex",
                                   flexDirection: "column",
                                   justifyContent: "space-between",
                              }}
                         >
                              <h2 className="text-xl md:text-2xl font-bold text-center mb-2 flex-shrink-0">
                                   {article1Title}
                              </h2>
                              {article1PdfPath && (
                                   <div className="flex justify-center flex-shrink-0">
                                        <Link href={article1PdfPath} target="_blank" rel="noopener noreferrer">
                                             <button className="flex items-center px-3 py-1 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors text-sm whitespace-nowrap">
                                                  <Image
                                                       src="/PDF_file_icon.svg"
                                                       alt="PDF"
                                                       width={16}
                                                       height={16}
                                                       className="mr-1 flex-shrink-0"
                                                  />
                                                  <span>Download PDF</span>
                                             </button>
                                        </Link>
                                   </div>
                              )}
                         </div>
                         <div className="flex-grow p-3 md:p-4 overflow-hidden bg-gray-50">
                              <p
                                   className="text-justify leading-relaxed"
                                   style={{
                                        fontSize: `${Math.max(article1ContentFontSize, 12)}px`,
                                        lineHeight: "1.6",
                                   }}
                              >
                                   {article1Content}
                              </p>
                         </div>
                    </div>

                    {/* Right text box */}
                    <div className="flex flex-col min-h-0 border-2 border-gray-400 rounded-lg overflow-hidden shadow-sm">
                         <div
                              ref={article2HeaderRef}
                              className="flex-shrink-0 p-3 md:p-4 bg-gray-100 border-b-2 border-gray-400"
                              style={{
                                   minHeight: headerHeight ? `${headerHeight}px` : "auto",
                                   display: "flex",
                                   flexDirection: "column",
                                   justifyContent: "space-between",
                              }}
                         >
                              <h2 className="text-xl md:text-2xl font-bold text-center mb-2 flex-shrink-0">
                                   {article2Title}
                              </h2>
                              {article2PdfPath && (
                                   <div className="flex justify-center flex-shrink-0">
                                        <Link href={article2PdfPath} target="_blank" rel="noopener noreferrer">
                                             <button className="flex items-center px-3 py-1 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors text-sm whitespace-nowrap">
                                                  <Image
                                                       src="/PDF_file_icon.svg"
                                                       alt="PDF"
                                                       width={16}
                                                       height={16}
                                                       className="mr-1 flex-shrink-0"
                                                  />
                                                  <span>Download PDF</span>
                                             </button>
                                        </Link>
                                   </div>
                              )}
                         </div>
                         <div className="flex-grow p-3 md:p-4 overflow-hidden bg-gray-50">
                              <p
                                   className="text-justify leading-relaxed"
                                   style={{
                                        fontSize: `${Math.max(article2ContentFontSize, 12)}px`,
                                        lineHeight: "1.6",
                                   }}
                              >
                                   {article2Content}
                              </p>
                         </div>
                    </div>
               </div>

               {/* Hidden measurement div */}
               <div
                    ref={measurementRef}
                    style={{ position: "absolute", visibility: "hidden", height: "auto", width: "auto" }}
               />
          </div>
     );
};

export default NewsArticleLayout;

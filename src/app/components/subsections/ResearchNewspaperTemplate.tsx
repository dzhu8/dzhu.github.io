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
     mainContent?: string;
     secondaryContent?: string;
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
     mainContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel justo eu nibh vestibulum tincidunt. Praesent faucibus, nisl in lobortis tincidunt, magna lacus pulvinar mauris, nec accumsan odio metus et dolor. Cras non nisi ut augue pulvinar luctus. Curabitur eget augue ut turpis feugiat finibus eget sed nibh. Duis fermentum, tortor vel dictum lobortis, arcu nisi condimentum eros, vel ullamcorper risus dolor eget nisl. Praesent sodales nibh at euismod mattis. Sed dignissim, tortor sed finibus pellentesque, felis dolor scelerisque massa, eget tincidunt libero magna sit amet risus.",
     secondaryContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel justo eu nibh vestibulum tincidunt. Praesent faucibus, nisl in lobortis tincidunt, magna lacus pulvinar mauris, nec accumsan odio metus et dolor. Cras non nisi ut augue pulvinar luctus. Curabitur eget augue ut turpis feugiat finibus eget sed nibh. Duis fermentum, tortor vel dictum lobortis, arcu nisi condimentum eros, vel ullamcorper risus dolor eget nisl. Praesent sodales nibh at euismod mattis. Sed dignissim, tortor sed finibus pellentesque, felis dolor scelerisque massa, eget tincidunt libero magna sit amet risus.",
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
     // Get the first letter of the main content for the drop cap
     const firstLetter = mainContent.charAt(0);
     const restOfContent = mainContent.substring(1);

     // Refs for measuring header heights
     const article1HeaderRef = useRef<HTMLDivElement>(null);
     const article2HeaderRef = useRef<HTMLDivElement>(null);
     const [headerHeight, setHeaderHeight] = useState<number | null>(null);
     const [currentUrl, setCurrentUrl] = useState<string>('');

     // Get current URL on client side
     useEffect(() => {
          if (typeof window !== 'undefined') {
               setCurrentUrl(window.location.href);
          }
     }, []);

     // Ensure consistent header height
     useEffect(() => {
          const calculateHeaderHeight = () => {
               if (article1HeaderRef.current && article2HeaderRef.current) {
                    const height1 = article1HeaderRef.current.offsetHeight;
                    const height2 = article2HeaderRef.current.offsetHeight;
                    setHeaderHeight(Math.max(height1, height2));
               }
          };

          // Calculate on mount and when window resizes
          calculateHeaderHeight();
          window.addEventListener("resize", calculateHeaderHeight);

          return () => {
               window.removeEventListener("resize", calculateHeaderHeight);
          };
     }, []);

     return (
          <div className="max-w-6xl mx-auto p-6">
               {/* Title */}
               <div className="mb-4 p-2">
                    <h1 className="text-4xl font-bold">{title}</h1>

                    {/* Action Buttons Row - centered */}
                    <div className="mt-3 flex justify-center space-x-4">
                         {/* PDF Download Button - only shown if pdfPath is provided */}
                         {pdfPath && (
                              <Link href={pdfPath} target="_blank" rel="noopener noreferrer">
                                   <button className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors">
                                        <Image
                                             src="/PDF_file_icon.svg"
                                             alt="PDF"
                                             width={20}
                                             height={20}
                                             className="mr-2"
                                        />
                                        <span>Download PDF</span>
                                   </button>
                              </Link>
                         )}

                         {/* GitHub Button - only shown if githubUrl is provided */}
                         {githubUrl && (
                              <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
                                   <button className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors">
                                        <Image
                                             src="/Octicons-mark-github.svg"
                                             alt="GitHub"
                                             width={20}
                                             height={20}
                                             className="mr-2"
                                        />
                                        <span>View on GitHub</span>
                                   </button>
                              </Link>
                         )}
                    </div>
               </div>

               {/* Date, Journal and Share */}
               <div className="flex items-center mb-6">
                    <div className="mr-auto">
                         <span className="text-xl">{date}</span>
                         {journal && (
                              <>
                                   <span className="text-xl">, </span>
                                   <span className="text-xl italic">{journal}</span>
                              </>
                         )}
                    </div>
                    <span className="mr-2">Share:</span>
                    <div className="flex space-x-2">
                         {/* LinkedIn */}
                         <a
                              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-violet-800 flex items-center justify-center hover:bg-violet-700 transition-colors"
                         >
                              <Image
                                   src="/LinkedIn_icon.svg"
                                   alt="Share on LinkedIn"
                                   width={20}
                                   height={20}
                              />
                         </a>
                         
                         {/* X (Twitter) */}
                         <a
                              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-violet-800 flex items-center justify-center hover:bg-violet-700 transition-colors"
                         >
                              <Image
                                   src="/X_icon.svg"
                                   alt="Share on X"
                                   width={16}
                                   height={16}
                                   className="invert" // Invert colors for better visibility
                              />
                         </a>
                         
                         {/* Bluesky */}
                         <a
                              href={`https://bsky.app/intent/compose?text=${encodeURIComponent(title + ' ' + currentUrl)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-violet-800 flex items-center justify-center hover:bg-violet-700 transition-colors"
                         >
                              <Image
                                   src="/Bluesky_icon.svg"
                                   alt="Share on Bluesky"
                                   width={16}
                                   height={16}
                              />
                         </a>
                         
                         {/* Reddit */}
                         <a
                              href={`https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 rounded-full bg-violet-800 flex items-center justify-center hover:bg-violet-700 transition-colors"
                         >
                              <Image
                                   src="/reddit_icon.svg"
                                   alt="Share on Reddit"
                                   width={20}
                                   height={20}
                              />
                         </a>
                    </div>
               </div>

               {/* Main content */}
               <div className="flex flex-wrap mb-6">
                    {/* Image container */}
                    <div className="w-full md:w-1/3 mb-4 md:mb-0">
                         <div className="bg-blue-800 h-96 flex items-center justify-center text-white overflow-hidden">
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
                         <div className="grid grid-cols-2 gap-8 h-full">
                              {/* Left column with drop cap */}
                              <div className="p-2">
                                   <p className="text-justify">
                                        <span className="float-left text-7xl font-serif mr-2 mt-1 leading-none">
                                             {firstLetter}
                                        </span>
                                        <span style={{ fontSize: `${mainContentFontSize}px` }}>{restOfContent}</span>
                                   </p>
                              </div>

                              {/* Right column */}
                              <div className="p-2">
                                   <p className="text-justify" style={{ fontSize: `${secondaryContentFontSize}px` }}>
                                        {secondaryContent}
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Bottom text boxes */}
               <div className="grid grid-cols-2 gap-8">
                    {/* Left text box */}
                    <div className="flex flex-col h-full">
                         <div
                              ref={article1HeaderRef}
                              className="p-2 mb-2"
                              style={headerHeight ? { height: `${headerHeight}px` } : undefined}
                         >
                              <h2 className="text-2xl font-bold text-center">{article1Title}</h2>
                              {article1PdfPath && (
                                   <div className="flex justify-center mt-2">
                                        <Link href={article1PdfPath} target="_blank" rel="noopener noreferrer">
                                             <button className="flex items-center px-3 py-1 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors text-sm">
                                                  <Image
                                                       src="/PDF_file_icon.svg"
                                                       alt="PDF"
                                                       width={16}
                                                       height={16}
                                                       className="mr-1"
                                                  />
                                                  <span>Download PDF</span>
                                             </button>
                                        </Link>
                                   </div>
                              )}
                         </div>
                         <div className="p-2 flex-grow">
                              <p className="text-justify" style={{ fontSize: `${article1ContentFontSize}px` }}>
                                   {article1Content}
                              </p>
                         </div>
                    </div>

                    {/* Right text box */}
                    <div className="flex flex-col h-full">
                         <div
                              ref={article2HeaderRef}
                              className="p-2 mb-2"
                              style={headerHeight ? { height: `${headerHeight}px` } : undefined}
                         >
                              <h2 className="text-2xl font-bold text-center">{article2Title}</h2>
                              {article2PdfPath && (
                                   <div className="flex justify-center mt-2">
                                        <Link href={article2PdfPath} target="_blank" rel="noopener noreferrer">
                                             <button className="flex items-center px-3 py-1 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors text-sm">
                                                  <Image
                                                       src="/PDF_file_icon.svg"
                                                       alt="PDF"
                                                       width={16}
                                                       height={16}
                                                       className="mr-1"
                                                  />
                                                  <span>Download PDF</span>
                                             </button>
                                        </Link>
                                   </div>
                              )}
                         </div>
                         <div className="p-2 flex-grow">
                              <p className="text-justify" style={{ fontSize: `${article2ContentFontSize}px` }}>
                                   {article2Content}
                              </p>
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default NewsArticleLayout;

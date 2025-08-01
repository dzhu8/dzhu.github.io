import React, { useState, useEffect } from "react";
import Image from "next/image";

interface TextEditWindowProps {
     content?: string;
     title?: string;
     imagePath?: string;
     languages?: string[];
}

const TextEditWindow: React.FC<TextEditWindowProps> = ({
     content = "This is a sample text in the TextEdit window.",
     title = "Untitled",
     imagePath = "/JS_monitor_logo.png", // default to the JS monitor logo for now
     languages = ["js", "react", "html", "css"],
}) => {
     // State for scale factor tracking
     const [scaleFactor, setScaleFactor] = useState(1);
     
     // State for text formatting
     const [fontFamily, setFontFamily] = useState("Helvetica");
     const [fontStyle, setFontStyle] = useState("Regular");
     const [fontSize, setFontSize] = useState("16");
     const [textColor, setTextColor] = useState("#000000");
     const [isBold, setIsBold] = useState(false);
     const [isItalic, setIsItalic] = useState(false);
     const [isUnderline, setIsUnderline] = useState(false);
     const [isStrikethrough, setIsStrikethrough] = useState(false);
     const [alignment, setAlignment] = useState<"left" | "center" | "right" | "justify">("left");
     const [lineSpacing, setLineSpacing] = useState("1.25");

     // State for dropdown visibility
     const [openDropdown, setOpenDropdown] = useState<string | null>(null);

     // Track scale factor changes
     useEffect(() => {
          const updateScale = () => {
               const scaleFactorValue = parseFloat(
                    getComputedStyle(document.documentElement).getPropertyValue('--scale-factor') || '1'
               );
               setScaleFactor(scaleFactorValue);
          };

          // Initial scale update
          updateScale();

          // Listen for resize events to update scale
          window.addEventListener('resize', updateScale);
          
          return () => {
               window.removeEventListener('resize', updateScale);
          };
     }, []);

     // Determine if we should use compact layout
     const isCompactLayout = scaleFactor < 0.6;

     // Generate text style based on current settings
     const getTextStyle = () => {
          const style = {
               fontFamily,
               fontSize: `${fontSize}px`,
               color: textColor,
               fontWeight: isBold || fontStyle.includes("Bold") ? "bold" : "normal",
               fontStyle: isItalic || fontStyle.includes("Italic") ? "italic" : "normal",
               textDecoration: [] as string[],
               textAlign: alignment,
               lineHeight: lineSpacing,
          };

          if (isUnderline) style.textDecoration.push("underline");
          if (isStrikethrough) style.textDecoration.push("line-through");

          const textDecoration = style.textDecoration.join(" ");
          return { ...style, textDecoration };
     };

     // Handle dropdown toggle
     const toggleDropdown = (dropdown: string | null) => {
          if (openDropdown === dropdown) {
               setOpenDropdown(null);
          } else {
               setOpenDropdown(dropdown);
          }
     };

     // Dropdown for font family
     const fontFamilyOptions = ["Helvetica", "Arial", "Times New Roman", "Courier"];

     // Dropdown for font style
     const fontStyleOptions = ["Regular", "Bold", "Italic", "Bold Italic"];

     // Dropdown for font size
     const fontSizeOptions = ["9", "10", "12", "14", "16", "18", "24"];

     // Dropdown for line spacing
     const lineSpacingOptions = ["1.0", "1.25", "1.5", "2.0", "2.5"];

     // Language icon mapping
     const getLanguageIcon = (lang: string) => {
          const langLower = lang.toLowerCase();
          switch (langLower) {
               case "js":
               case "javascript":
                    return "💛"; // Yellow heart for JavaScript
               case "ts":
               case "typescript":
                    return "💙"; // Blue heart for TypeScript
               case "react":
                    return "⚛️"; // Atom symbol for React
               case "html":
                    return "🔶"; // Orange diamond for HTML
               case "css":
                    return "🔷"; // Blue diamond for CSS
               case "python":
                    return "🐍"; // Snake for Python
               case "java":
                    return "☕"; // Coffee for Java
               case "php":
                    return "🐘"; // Elephant for PHP
               case "ruby":
                    return "💎"; // Gem for Ruby
               case "go":
                    return "🔵"; // Blue circle for Go
               default:
                    return "💻"; // Generic computer for other languages
          }
     };

     return (
          <div className={`w-full max-w-6xl mx-auto ${isCompactLayout ? 'flex-col space-y-4' : 'flex gap-6'}`}>
               {/* Polaroid frame */}
               <div className={`${isCompactLayout ? 'w-full max-w-md mx-auto' : 'flex-none w-64'} flex flex-col`}>
                    <div className="bg-white p-4 shadow-lg flex flex-col border-2 border-gray-300 rounded-sm h-full flex-grow">
                         {/* Image area */}
                         <div
                              className="bg-gray-100 mb-4 flex items-center justify-center overflow-hidden border border-gray-300 flex-grow"
                              style={{ minHeight: isCompactLayout ? "150px" : "200px" }}
                         >
                              <Image
                                   src={imagePath}
                                   alt="Project Screenshot"
                                   width={isCompactLayout ? 200 : 250}
                                   height={isCompactLayout ? 200 : 250}
                                   style={{ objectFit: "contain" }}
                              />
                         </div>

                         {/* Language icons */}
                         <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-gray-300">
                              {languages.map((lang, index) => (
                                   <div key={index} className="flex items-center" title={lang}>
                                        <span className={`${isCompactLayout ? 'text-xl' : 'text-2xl'}`}>{getLanguageIcon(lang)}</span>
                                        <span className="ml-1 text-xs text-gray-600">{lang}</span>
                                   </div>
                              ))}
                         </div>
                    </div>
               </div>

               {/* Text editor */}
               <div className="flex-grow">
                    <div className="rounded-lg overflow-hidden shadow-lg border border-gray-300">
                         {/* Title bar */}
                         <div className="h-10 bg-gradient-to-b from-gray-100 to-gray-200 flex items-center relative border-b border-gray-300">
                              {/* Window buttons */}
                              <div className="absolute left-3 flex space-x-2">
                                   <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600"></div>
                                   <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500"></div>
                                   <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600"></div>
                              </div>

                              {/* Window title */}
                              <div className="w-full text-center text-lg font-semibold text-gray-700">{title}</div>
                         </div>

                         {/* Toolbar */}
                         <div className={`${isCompactLayout ? 'min-h-20' : 'h-12'} bg-gradient-to-b from-gray-50 to-gray-100 px-2 border-b border-gray-300`}>
                              <div className={`${isCompactLayout ? 'flex flex-wrap gap-1 py-1' : 'flex items-center h-full'}`}>
                                   {/* First row of controls in compact mode, or main row in normal mode */}
                                   <div className={`${isCompactLayout ? 'flex flex-wrap gap-1 w-full' : 'flex items-center'}`}>
                                        {/* Font family dropdown */}
                                        <div className="relative mx-1">
                                             <button
                                                  className={`px-2 py-1 text-xs border border-gray-300 rounded bg-gradient-to-b from-white to-gray-100 flex items-center justify-between ${isCompactLayout ? 'w-20' : 'w-24'}`}
                                                  onClick={() => toggleDropdown("fontFamily")}
                                             >
                                                  {isCompactLayout ? fontFamily.slice(0, 3) : fontFamily} <span className="ml-1">▼</span>
                                             </button>
                                             {openDropdown === "fontFamily" && (
                                                  <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10">
                                                       {fontFamilyOptions.map((font) => (
                                                            <div
                                                                 key={font}
                                                                 className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                                                                 onClick={() => {
                                                                      setFontFamily(font);
                                                                      setOpenDropdown(null);
                                                                 }}
                                                            >
                                                                 {font}
                                                            </div>
                                                       ))}
                                                  </div>
                                             )}
                                        </div>

                                        {/* Font style dropdown */}
                                        <div className="relative mx-1">
                                             <button
                                                  className={`px-2 py-1 text-xs border border-gray-300 rounded bg-gradient-to-b from-white to-gray-100 flex items-center justify-between ${isCompactLayout ? 'w-16' : 'w-20'}`}
                                                  onClick={() => toggleDropdown("fontStyle")}
                                             >
                                                  {isCompactLayout ? fontStyle.slice(0, 3) : fontStyle} <span className="ml-1">▼</span>
                                             </button>
                                             {openDropdown === "fontStyle" && (
                                                  <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10">
                                                       {fontStyleOptions.map((style) => (
                                                            <div
                                                                 key={style}
                                                                 className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                                                                 onClick={() => {
                                                                      setFontStyle(style);
                                                                      setIsBold(style.includes("Bold"));
                                                                      setIsItalic(style.includes("Italic"));
                                                                      setOpenDropdown(null);
                                                                 }}
                                                            >
                                                                 {style}
                                                            </div>
                                                       ))}
                                                  </div>
                                             )}
                                        </div>

                                        {/* Font size dropdown */}
                                        <div className="relative mx-1">
                                             <button
                                                  className="px-2 py-1 text-xs border border-gray-300 rounded bg-gradient-to-b from-white to-gray-100 flex items-center justify-between w-12"
                                                  onClick={() => toggleDropdown("fontSize")}
                                             >
                                                  {fontSize} <span className="ml-1">▼</span>
                                             </button>
                                             {openDropdown === "fontSize" && (
                                                  <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10">
                                                       {fontSizeOptions.map((size) => (
                                                            <div
                                                                 key={size}
                                                                 className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                                                                 onClick={() => {
                                                                      setFontSize(size);
                                                                      setOpenDropdown(null);
                                                                 }}
                                                            >
                                                                 {size}
                                                            </div>
                                                       ))}
                                                  </div>
                                             )}
                                        </div>

                                        {/* Text color */}
                                        <button
                                             className="w-8 h-8 mx-1 border border-gray-300 rounded flex items-center justify-center"
                                             onClick={() => setTextColor(textColor === "#000000" ? "#0000FF" : "#000000")}
                                        >
                                             <div className="w-4 h-4 rounded" style={{ backgroundColor: textColor }}></div>
                                        </button>

                                        {!isCompactLayout && (
                                             <>
                                                  {/* Formatting buttons - shown inline in normal mode */}
                                                  <button
                                                       className={`w-8 h-8 mx-1 border rounded flex items-center justify-center ${isStrikethrough ? "bg-gray-200 border-gray-400" : "border-gray-300"}`}
                                                       onClick={() => setIsStrikethrough(!isStrikethrough)}
                                                  >
                                                       <span className="text-sm" style={{ textDecoration: "line-through" }}>a</span>
                                                  </button>

                                                  <button
                                                       className={`w-8 h-8 mx-1 border rounded flex items-center justify-center ${isBold ? "bg-gray-200 border-gray-400" : "border-gray-300"}`}
                                                       onClick={() => setIsBold(!isBold)}
                                                  >
                                                       <span className="text-sm font-bold">B</span>
                                                  </button>

                                                  <button
                                                       className={`w-8 h-8 mx-1 border rounded flex items-center justify-center ${isItalic ? "bg-gray-200 border-gray-400" : "border-gray-300"}`}
                                                       onClick={() => setIsItalic(!isItalic)}
                                                  >
                                                       <span className="text-sm italic">I</span>
                                                  </button>

                                                  <button
                                                       className={`w-8 h-8 mx-1 border rounded flex items-center justify-center ${isUnderline ? "bg-gray-200 border-gray-400" : "border-gray-300"}`}
                                                       onClick={() => setIsUnderline(!isUnderline)}
                                                  >
                                                       <span className="text-sm underline">U</span>
                                                  </button>

                                                  {/* Divider */}
                                                  <div className="h-6 w-px bg-gray-300 mx-2"></div>

                                                  {/* Alignment buttons */}
                                                  <div className="flex border border-gray-300 rounded overflow-hidden">
                                                       <button
                                                            className={`w-8 h-8 flex items-center justify-center ${alignment === "left" ? "bg-gray-200" : "bg-gradient-to-b from-white to-gray-100"}`}
                                                            onClick={() => setAlignment("left")}
                                                       >
                                                            <span className="text-xs">≡</span>
                                                       </button>
                                                       <button
                                                            className={`w-8 h-8 flex items-center justify-center border-l border-gray-300 ${alignment === "center" ? "bg-gray-200" : "bg-gradient-to-b from-white to-gray-100"}`}
                                                            onClick={() => setAlignment("center")}
                                                       >
                                                            <span className="text-xs">≡</span>
                                                       </button>
                                                       <button
                                                            className={`w-8 h-8 flex items-center justify-center border-l border-gray-300 ${alignment === "right" ? "bg-gray-200" : "bg-gradient-to-b from-white to-gray-100"}`}
                                                            onClick={() => setAlignment("right")}
                                                       >
                                                            <span className="text-xs">≡</span>
                                                       </button>
                                                       <button
                                                            className={`w-8 h-8 flex items-center justify-center border-l border-gray-300 ${alignment === "justify" ? "bg-gray-200" : "bg-gradient-to-b from-white to-gray-100"}`}
                                                            onClick={() => setAlignment("justify")}
                                                       >
                                                            <span className="text-xs">≡</span>
                                                       </button>
                                                  </div>

                                                  {/* Divider */}
                                                  <div className="h-6 w-px bg-gray-300 mx-2"></div>

                                                  {/* Line spacing dropdown */}
                                                  <div className="relative mx-1">
                                                       <button
                                                            className="px-2 py-1 text-xs border border-gray-300 rounded bg-gradient-to-b from-white to-gray-100 flex items-center justify-between w-12"
                                                            onClick={() => toggleDropdown("lineSpacing")}
                                                       >
                                                            {lineSpacing} <span className="ml-1">▼</span>
                                                       </button>
                                                       {openDropdown === "lineSpacing" && (
                                                            <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10">
                                                                 {lineSpacingOptions.map((spacing) => (
                                                                      <div
                                                                           key={spacing}
                                                                           className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                                                                           onClick={() => {
                                                                                setLineSpacing(spacing);
                                                                                setOpenDropdown(null);
                                                                           }}
                                                                      >
                                                                           {spacing}
                                                                      </div>
                                                                 ))}
                                                            </div>
                                                       )}
                                                  </div>
                                             </>
                                        )}
                                   </div>

                                   {/* Second row for compact mode */}
                                   {isCompactLayout && (
                                        <div className="flex flex-wrap gap-1 w-full mt-1">
                                             {/* Formatting buttons - wrapped to second row in compact mode */}
                                             <button
                                                  className={`w-8 h-8 mx-1 border rounded flex items-center justify-center ${isStrikethrough ? "bg-gray-200 border-gray-400" : "border-gray-300"}`}
                                                  onClick={() => setIsStrikethrough(!isStrikethrough)}
                                             >
                                                  <span className="text-sm" style={{ textDecoration: "line-through" }}>a</span>
                                             </button>

                                             <button
                                                  className={`w-8 h-8 mx-1 border rounded flex items-center justify-center ${isBold ? "bg-gray-200 border-gray-400" : "border-gray-300"}`}
                                                  onClick={() => setIsBold(!isBold)}
                                             >
                                                  <span className="text-sm font-bold">B</span>
                                             </button>

                                             <button
                                                  className={`w-8 h-8 mx-1 border rounded flex items-center justify-center ${isItalic ? "bg-gray-200 border-gray-400" : "border-gray-300"}`}
                                                  onClick={() => setIsItalic(!isItalic)}
                                             >
                                                  <span className="text-sm italic">I</span>
                                             </button>

                                             <button
                                                  className={`w-8 h-8 mx-1 border rounded flex items-center justify-center ${isUnderline ? "bg-gray-200 border-gray-400" : "border-gray-300"}`}
                                                  onClick={() => setIsUnderline(!isUnderline)}
                                             >
                                                  <span className="text-sm underline">U</span>
                                             </button>

                                             {/* Alignment buttons - compact */}
                                             <div className="flex border border-gray-300 rounded overflow-hidden mx-1">
                                                  <button
                                                       className={`w-6 h-8 flex items-center justify-center ${alignment === "left" ? "bg-gray-200" : "bg-gradient-to-b from-white to-gray-100"}`}
                                                       onClick={() => setAlignment("left")}
                                                  >
                                                       <span className="text-xs">≡</span>
                                                  </button>
                                                  <button
                                                       className={`w-6 h-8 flex items-center justify-center border-l border-gray-300 ${alignment === "center" ? "bg-gray-200" : "bg-gradient-to-b from-white to-gray-100"}`}
                                                       onClick={() => setAlignment("center")}
                                                  >
                                                       <span className="text-xs">≡</span>
                                                  </button>
                                                  <button
                                                       className={`w-6 h-8 flex items-center justify-center border-l border-gray-300 ${alignment === "right" ? "bg-gray-200" : "bg-gradient-to-b from-white to-gray-100"}`}
                                                       onClick={() => setAlignment("right")}
                                                  >
                                                       <span className="text-xs">≡</span>
                                                  </button>
                                                  <button
                                                       className={`w-6 h-8 flex items-center justify-center border-l border-gray-300 ${alignment === "justify" ? "bg-gray-200" : "bg-gradient-to-b from-white to-gray-100"}`}
                                                       onClick={() => setAlignment("justify")}
                                                  >
                                                       <span className="text-xs">≡</span>
                                                  </button>
                                             </div>

                                             {/* Line spacing dropdown - compact */}
                                             <div className="relative mx-1">
                                                  <button
                                                       className="px-2 py-1 text-xs border border-gray-300 rounded bg-gradient-to-b from-white to-gray-100 flex items-center justify-between w-12"
                                                       onClick={() => toggleDropdown("lineSpacing")}
                                                  >
                                                       {lineSpacing} <span className="ml-1">▼</span>
                                                  </button>
                                                  {openDropdown === "lineSpacing" && (
                                                       <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10">
                                                            {lineSpacingOptions.map((spacing) => (
                                                                 <div
                                                                      key={spacing}
                                                                      className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                                                                      onClick={() => {
                                                                           setLineSpacing(spacing);
                                                                           setOpenDropdown(null);
                                                                      }}
                                                                 >
                                                                      {spacing}
                                                                 </div>
                                                            ))}
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Ruler */}
                         <div className="h-8 bg-gray-100 border-b border-gray-300 relative flex items-center">
                              {[...Array(9)].map((_, i) => (
                                   <React.Fragment key={i}>
                                        <div
                                             className="absolute w-px h-2.5 bg-gray-400"
                                             style={{ left: `${i * 100 + 8}px`, top: "0px" }}
                                        ></div>
                                        <div
                                             className="absolute text-xs text-gray-600"
                                             style={{
                                                  left: `${i * 100 + 8}px`,
                                                  transform: "translateX(-50%)",
                                                  bottom: "2px",
                                             }}
                                        >
                                             {i}
                                        </div>
                                   </React.Fragment>
                              ))}
                         </div>

                         {/* Text area */}
                         <div className={`${isCompactLayout ? 'h-48' : 'h-64'} p-4 bg-white w-full`} style={getTextStyle()}>
                              {content}
                         </div>
                    </div>
               </div>
          </div>
     );
};

export default TextEditWindow;

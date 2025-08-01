import React from "react";
import Image from "next/image";

interface PolaroidFrameProps {
     imagePath?: string;
     width?: number; // Width of the entire polaroid frame
     height?: number; // Height of the entire polaroid frame
     imageRatio?: number; // Ratio of image area to total frame height (0-1)
     children?: React.ReactNode; // Optional content for the bottom section (like language icons)
}

const PolaroidFrame: React.FC<PolaroidFrameProps> = ({
     imagePath = "/JS_monitor_logo.png",
     width = 256, // Default width (w-64 = 16rem = 256px)
     height = 320, // Default height to maintain good proportions
     imageRatio = 0.75, // Image takes up 75% of the frame height
     children,
}) => {
     // Calculate dimensions
     const frameStyle = {
          width: `${width}px`,
          height: `${height}px`,
     };

     const imageAreaHeight = height * imageRatio;
     const imageSize = Math.min(width * 0.8, imageAreaHeight * 0.8); // Image size with some padding

     return (
          <div className="flex flex-col" style={frameStyle}>
               <div className="bg-white p-4 shadow-lg flex flex-col border-2 border-gray-300 rounded-sm h-full">
                    {/* Image area */}
                    <div
                         className="bg-gray-100 mb-4 flex items-center justify-center overflow-hidden border border-gray-300 flex-grow"
                         style={{ height: `${imageAreaHeight - 32}px` }} // Subtract padding
                    >
                         <Image
                              src={imagePath}
                              alt="Project Screenshot"
                              width={imageSize}
                              height={imageSize}
                              style={{ objectFit: "contain" }}
                         />
                    </div>

                    {/* Optional bottom section (like language icons) */}
                    {children && <div className="pt-2 border-t border-gray-300">{children}</div>}
               </div>
          </div>
     );
};

export default PolaroidFrame;

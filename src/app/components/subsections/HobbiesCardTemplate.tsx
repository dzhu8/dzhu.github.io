import React from "react";
import Image from "next/image";

interface HobbiesCardProps {
     title: string;
     imagePath: string;
     description?: string;
}

const HobbiesCardTemplate: React.FC<HobbiesCardProps> = ({ title, imagePath, description }) => {
     return (
          <div className="hobbies-card">
               {/* Ribbon at the top */}
               <div className="card-ribbon"></div>

               {/* Staple in upper left corner */}
               <div className="card-staple"></div>

               {/* Card content */}
               <div className="card-content">
                    <div className="card-image-container">
                         <Image src={imagePath} alt={title} width={400} height={300} className="card-image" />
                    </div>
                    {description && <div className="card-description">{description}</div>}
               </div>
          </div>
     );
};

export default HobbiesCardTemplate;

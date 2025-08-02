"use client";

import ScrollFadeIn from "../animations/ScrollFadeIn";
import ThreeDContainer from "../ThreeDContainer";

interface SectionProps {
     id: string;
     title: string;
     children?: React.ReactNode;
     craneScale?: number;
     wingFlapSpeed?: number;
     pathSpeed?: number;
}

export default function Section({ id, title, children, craneScale, wingFlapSpeed, pathSpeed }: SectionProps) {
     // Only render 3D container if all crane parameters are provided
     const shouldRender3D = craneScale !== undefined && wingFlapSpeed !== undefined && pathSpeed !== undefined;

     return (
          <section id={id} className="content-section">
               {/* 3D Container for Section - only if parameters are provided */}
               {shouldRender3D && (
                    <ThreeDContainer 
                         showAxes={false}
                         isHeroSection={false}
                         craneScale={craneScale}
                         wingFlapSpeed={wingFlapSpeed}
                         pathSpeed={pathSpeed}
                    />
               )}
               
               <div className="container text-center">
                    <div className="content-piece">
                         <ScrollFadeIn delay={0} duration={600} threshold={0.3}>
                              <h2 className="text-6xl font-bold mb-6">{title}</h2>
                         </ScrollFadeIn>
                         <div>{children}</div>
                    </div>
               </div>
          </section>
     );
}

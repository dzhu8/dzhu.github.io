"use client";

import ScrollFadeIn from "../animations/ScrollFadeIn";
import ThreeDContainer from "../../test/ThreeDContainer";

interface SectionProps {
     id: string;
     title: string;
     children?: React.ReactNode;
     craneScale?: number;
     wingFlapSpeed?: number;
}

export default function Section({ id, title, children, craneScale = 0.5, wingFlapSpeed = 7.5 }: SectionProps) {
     return (
          <section id={id} className="content-section">
               {/* 3D Container for Section */}
               <ThreeDContainer 
                    showAxes={true}
                    isHeroSection={false}
                    craneScale={craneScale}
                    wingFlapSpeed={wingFlapSpeed}
               />
               
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

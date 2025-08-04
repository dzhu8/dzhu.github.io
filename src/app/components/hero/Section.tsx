"use client";

import ScrollFadeIn from "../animations/ScrollFadeIn";
import ThreeDContainer from "../ThreeDContainer";
import HobbiesBackgroundPolaroids from "../subsections/HobbiesBackgroundPolaroids";

interface SubsectionProps {
     id?: string;
     title: string;
     children: React.ReactNode;
}

interface SectionProps {
     id: string;
     title: string;
     children?: React.ReactNode;
     subsections?: SubsectionProps[];
     craneScale?: number;
     wingFlapSpeed?: number;
     pathSpeed?: number;
     craneCount?: number;
}

export default function Section({
     id,
     title,
     children,
     subsections,
     craneScale,
     wingFlapSpeed,
     pathSpeed,
     craneCount,
}: SectionProps) {
     // Only render 3D container if all crane parameters are provided
     const shouldRender3D = craneScale !== undefined && wingFlapSpeed !== undefined && pathSpeed !== undefined;

     // Check if this is the hobbies section
     const isHobbiesSection = id === "hobbies";

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
                         craneCount={craneCount}
                    />
               )}

               {/* Hobbies Background Polaroids - only for hobbies section */}
               {isHobbiesSection && <HobbiesBackgroundPolaroids />}

               <div className="container text-center">
                    <div className="content-piece">
                         <ScrollFadeIn delay={0} duration={600} threshold={0.3}>
                              <h2 className="text-6xl font-bold mb-6">{title}</h2>
                         </ScrollFadeIn>

                         {/* Render main children if no subsections */}
                         {!subsections && <div>{children}</div>}

                         {/* Render subsections within the same content-piece */}
                         {subsections &&
                              subsections.map((subsection, index) => (
                                   <div key={subsection.id || index} className="subsection-content" id={subsection.id}>
                                        <ScrollFadeIn delay={200 * (index + 1)} duration={600} threshold={0.3}>
                                             <h3 className="text-4xl font-bold mb-4 mt-8">{subsection.title}</h3>
                                        </ScrollFadeIn>
                                        <div>{subsection.children}</div>
                                   </div>
                              ))}
                    </div>
               </div>
          </section>
     );
}

export type { SubsectionProps };

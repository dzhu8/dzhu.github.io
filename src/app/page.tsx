"use client";

import React, { useState } from "react";
import Hero from "./components/hero/Hero";
import Navbar from "./components/hero/Navbar";
import Section from "./components/hero/Section";
import NewsArticleLayout from "./components/subsections/ResearchNewspaperTemplate";
import TextEditWindow from "./components/subsections/ProjectsTextEditorTemplate";
import ScrollFadeIn from "./components/animations/ScrollFadeIn";

export default function Home() {
     const [craneScale, setCraneScale] = useState(0.5);
     const [wingFlapSpeed, setWingFlapSpeed] = useState(7.5);

     return (
          <main>
               {/* Fixed navigation bar at the top */}
               <Navbar />

               {/* Floating crane scale slider */}
               <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    minWidth: '200px'
               }}>
                    {/* Crane Scale Slider */}
                    <div style={{ marginBottom: '20px' }}>
                         <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                              Crane Scale: {craneScale.toFixed(2)}
                         </div>
                         <input
                              type="range"
                              min="0.1"
                              max="2.0"
                              step="0.1"
                              value={craneScale}
                              onChange={(e) => setCraneScale(parseFloat(e.target.value))}
                              style={{
                                   width: '100%',
                                   height: '6px',
                                   borderRadius: '3px',
                                   background: '#ddd',
                                   outline: 'none'
                              }}
                         />
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                              <span>0.1</span>
                              <span>2.0</span>
                         </div>
                    </div>

                    {/* Wing Flap Speed Slider */}
                    <div>
                         <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                              Wing Flap Speed: {wingFlapSpeed.toFixed(1)}
                         </div>
                         <input
                              type="range"
                              min="0.5"
                              max="15"
                              step="0.5"
                              value={wingFlapSpeed}
                              onChange={(e) => setWingFlapSpeed(parseFloat(e.target.value))}
                              style={{
                                   width: '100%',
                                   height: '6px',
                                   borderRadius: '3px',
                                   background: '#ddd',
                                   outline: 'none'
                              }}
                         />
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                              <span>Slow (0.5)</span>
                              <span>Fast (15)</span>
                         </div>
                    </div>
               </div>

               {/* Hero Section with graph paper background */}
               <Hero craneScale={craneScale} wingFlapSpeed={wingFlapSpeed} />

               {/* Content Sections with white backgrounds */}
               <Section id="research" title="Research" craneScale={craneScale} wingFlapSpeed={wingFlapSpeed}>
                    <ScrollFadeIn delay={200} duration={800} direction="up">
                         <NewsArticleLayout
                              title="Spateo: Spatiotemporal modeling of molecular holograms"
                              imagePath="/Spateo.png"
                              pdfPath="/Spateo.pdf"
                              githubUrl="https://github.com/aristoteleo/spateo-release"
                              date="November 11th, 2024"
                              journal="Cell"
                              mainContentFontSize={14}
                              secondaryContentFontSize={14}
                              article1ContentFontSize={14}
                              article2ContentFontSize={14}
                              mainContent="Quantifying spatiotemporal dynamics during embryogenesis is crucial for understanding congenital diseases. We developed Spateo, a 3D spatiotemporal modeling framework, and applied it to a 3D mouse embryogenesis atlas at E9.5 and E11.5, capturing eight million cells. Spateo enables scalable, partial, non-rigid alignment, multi-slice refinement, and mesh correction to create molecular holograms of whole embryos. It introduces digitization methods to uncover multi-level biology from subcellular to whole organ, identifying expression gradients along orthogonal axes of emergent 3D structures, e.g., "
                              secondaryContent="secondary organizers such as the zona limitans intrathalamica (ZLI). Spateo further jointly models intercellular and intracellular interaction to dissect signaling landscapes in 3D structures. Lastly, Spateo introduces morphometric vector fields of cell migration and integrates spatial differential geometry to unveil molecular programs underlying asymmetrical murine heart organogenesis and others, bridging macroscopic changes with molecular dynamics. Thus, Spateo enables the study of organ ecology at a molecular level in 3D space over time. From both a technological and intellectual perspective, this has been my most complex paper (and certainly the one that has taken the most time and effort!)"
                              article1Title="Related: Mapping cells through space and time with moscot"
                              article1Content="Introduces multi-omics single-cell optimal transport (moscot), a scalable framework for optimal transport in single-cell genomics. This can be used to align mouse cells across space and time."
                              article1PdfPath="/pdf/moscot.pdf"
                              article2Title="Related: A single-cell time-lapse of mouse prenatal development from gastrula to birth"
                              article2Content="This study established a single-cell atlas spanning 12.4 million nuclei from 83 embryos, precisely staged at 2- to 6-hour intervals spanning late gastrulation, annotating hundreds of cell types."
                              article2PdfPath="/pdf/mouse_atlas.pdf"
                         />
                    </ScrollFadeIn>
               </Section>

               <Section id="projects" title="Projects" craneScale={craneScale} wingFlapSpeed={wingFlapSpeed}>
                    <div className="space-y-12"> {}
                      <ScrollFadeIn delay={100} duration={700} direction="left">
                        <TextEditWindow
                            title="JSMonitor"
                            imagePath="/JS_monitor_logo.png"
                            languages={["python"]}
                            content={`A suite of terminal commands for quickly managing JavaScript/TypeScript project dependencies that I created out of pure laziness. Currently, this contains two tools: a dependency updater that fetches the latest versions of dependencies and devDependencies and installs them if outdated,
  and an import scanner that checks codebases for import statements that are not yet installed. These packages are installed, and the package file is updated accordingly. Stay tuned for further updates!`}
                        />
                      </ScrollFadeIn>

                      <ScrollFadeIn delay={100} duration={700} direction="right">
                        <TextEditWindow
                            title="Orange"
                            imagePath="/Orange_logo.png"
                            languages={["python"]}
                            content={`A command-line tool for formatting and organizing JavaScript/TypeScript files and additional common file types found in JS/TS projects. Formats files with extensions .js, .jsx, .ts, .tsx, .vue, .html, and .json by default. Allows for custom Prettier config and ignore files to be used,
                              (by specifying the path to --config flag) with fallback to a default configuration if none is provided.`}
                        />
                      </ScrollFadeIn>
                    </div>
               </Section>

               <Section id="hobbies" title="Hobbies" craneScale={craneScale} wingFlapSpeed={wingFlapSpeed}>
                    {/* Hobbies content will be added later */}
               </Section>
          </main>
     );
}

"use client";

import Hero from "./components/hero/Hero";
import Navbar from "./components/hero/Navbar";
import Section from "./components/hero/Section";
import ScrollFadeIn from "./components/animations/ScrollFadeIn";
import NewsArticleLayout from "./components/subsections/ResearchNewspaperTemplate";
import TextEditWindow from "./components/subsections/ProjectsTextEditorTemplate";
import CraneAnimatedProjectCard from "./components/subsections/CraneAnimatedProjectCard";
import { HobbiesContainer } from "./components/subsections/HobbiesCardTemplate";
import ScaleTracker from "./components/ScaleTracker";

export default function Home() {
     return (
          <main>
               {/* Scale Factor Controller */}
               <ScaleTracker />

               {/* Fixed navigation bar at the top */}
               <Navbar />

               {/* Hero Section with graph paper background */}
               <Hero craneScale={1.2} wingFlapSpeed={2.8} pathSpeed={11.0} />

               {/* Content Sections with white backgrounds */}
               <Section id="research" title="Research" craneScale={1.2} wingFlapSpeed={2.8} pathSpeed={11.0}>
                    <ScrollFadeIn delay={200} duration={800} direction="up">
                         <NewsArticleLayout
                              title="Spateo: Spatiotemporal modeling of molecular holograms"
                              imagePath="/Spateo.png"
                              pdfPath="/pdf/Spateo.pdf"
                              githubUrl="https://github.com/aristoteleo/spateo-release"
                              date="November 11th, 2024"
                              journal="Cell"
                              mainContentFontSize={14}
                              secondaryContentFontSize={14}
                              article1ContentFontSize={14}
                              article2ContentFontSize={14}
                              fullText="Quantifying spatiotemporal dynamics during embryogenesis is crucial for understanding congenital diseases. We developed Spateo, a 3D spatiotemporal modeling framework, and applied it to a 3D mouse embryogenesis atlas at E9.5 and E11.5, capturing eight million cells. Spateo enables scalable, partial, non-rigid alignment, multi-slice refinement, and mesh correction to create molecular holograms of whole embryos. It introduces digitization methods to uncover multi-level biology from subcellular to whole organ, identifying expression gradients along orthogonal axes of emergent 3D structures, e.g., secondary organizers such as the zona limitans intrathalamica (ZLI). Spateo further jointly models intercellular and intracellular interaction to dissect signaling landscapes in 3D structures. Lastly, Spateo introduces morphometric vector fields of cell migration and integrates spatial differential geometry to unveil molecular programs underlying asymmetrical murine heart organogenesis and others, bridging macroscopic changes with molecular dynamics. Thus, Spateo enables the study of organ ecology at a molecular level in 3D space over time. From both a technological and intellectual perspective, this has been my most complex paper (and certainly the one that has taken the most time and effort!)"
                              article1Title="Related: Mapping cells through space and time with moscot"
                              article1Content="Introduces multi-omics single-cell optimal transport (moscot), a scalable framework for optimal transport in single-cell genomics. This can be used to align mouse cells across space and time."
                              article1PdfPath="/pdf/moscot.pdf"
                              article2Title="Related: A single-cell time-lapse of mouse prenatal development from gastrula to birth"
                              article2Content="This study established a single-cell atlas spanning 12.4 million nuclei from 83 embryos, precisely staged at 2- to 6-hour intervals spanning late gastrulation, annotating hundreds of cell types."
                              article2PdfPath="/pdf/mouse_atlas.pdf"
                         />
                    </ScrollFadeIn>
               </Section>

               <Section id="projects" title="Projects" craneScale={1.2} wingFlapSpeed={2.8} pathSpeed={11.0}>
                    <div className="space-y-12">
                         <ScrollFadeIn delay={100} duration={700} direction="left">
                              <TextEditWindow
                                   title="JSMonitor"
                                   imagePath="/JS_monitor_logo.png"
                                   languages={["python"]}
                                   content={`A suite of terminal commands for quickly managing JavaScript/TypeScript project dependencies. Currently, this contains two tools: a dependency updater that fetches the latest versions of dependencies and devDependencies and installs them if outdated,
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
                         <ScrollFadeIn delay={100} duration={700} direction="right">
                              <CraneAnimatedProjectCard
                                   title="3D Animation Toolbox"
                                   languages={["javascript", "typescript"]}
                                   content={`A set of 3D asset objects and examples of animations involving 3D assets. Currently, includes basic particle animations (rain, snowflakes, fire, etc.), an interactive flock of birds, and an animation of origami cranes in flight (which was utilized in this website!). This is not yet complete; additional examples and usage tutorials will be added in the future.`}
                              />
                         </ScrollFadeIn>
                    </div>
               </Section>

               <Section id="hobbies" title="Hobbies">
                    <ScrollFadeIn delay={200} duration={800} direction="up">
                         <HobbiesContainer
                              showDebugInfo={false}
                              hobbies={[
                                   {
                                        title: "Test",
                                        description: "Test.",
                                   },
                                   {
                                        title: "Test",
                                        description: "Test.",
                                   },
                              ]}
                         />
                    </ScrollFadeIn>
               </Section>
          </main>
     );
}

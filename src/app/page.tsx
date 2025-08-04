"use client";

import Hero from "./components/hero/Hero";
import Navbar from "./components/hero/Navbar";
import Section from "./components/hero/Section";
import ScrollFadeIn from "./components/animations/ScrollFadeIn";
import NewsArticleLayout from "./components/subsections/ResearchNewspaperTemplate";
import TextEditWindow from "./components/subsections/ProjectsTextEditorTemplate";
import CraneAnimatedProjectCard from "./components/subsections/CraneAnimatedProjectCard";
import { CookingContainer } from "./components/subsections/CookingCardTemplate";
import { BakingContainer } from "./components/subsections/BakingCardTemplate";
import { StravaEmbedContainer } from "./components/subsections/StravaEmbed";
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
               <Section id="research" title="Research" craneScale={0.4} wingFlapSpeed={2.8} pathSpeed={11.0}>
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
                              fullText="Quantifying spatiotemporal dynamics during embryogenesis is crucial for understanding congenital diseases. We developed Spateo, a 3D spatiotemporal modeling framework, and applied it to a 3D mouse embryogenesis atlas at E9.5 and E11.5, capturing eight million cells. Spateo enables scalable, partial, non-rigid alignment, multi-slice refinement, and mesh correction to create molecular holograms of whole embryos. It introduces digitization methods to uncover multi-level biology from subcellular to whole organ, identifying expression gradients along orthogonal axes of emergent 3D structures, e.g., secondary organizers such as the zona limitans intrathalamica (ZLI). Spateo further jointly models intercellular and intracellular interaction to dissect signaling landscapes in 3D structures. Lastly, Spateo introduces morphometric vector fields of cell migration and integrates spatial differential geometry to unveil molecular programs underlying asymmetrical murine heart organogenesis and others, bridging macroscopic changes with molecular dynamics. Thus, Spateo enables the study of organ ecology at a molecular level in 3D space over time. From both a technological and intellectual perspective, this has been my most complex paper (and certainly the one that has taken the most time and effort!), and I'm happy to have made something that is useful for many others in the field."
                              article1Title="Related: Mapping cells through space and time with moscot"
                              article1Content="Introduces multi-omics single-cell optimal transport (moscot), a scalable framework for optimal transport in single-cell genomics. This can be used to align mouse cells across space and time."
                              article1PdfPath="/pdf/moscot.pdf"
                              article2Title="Related: A single-cell time-lapse of mouse prenatal development from gastrula to birth"
                              article2Content="This study established a single-cell atlas spanning 12.4 million nuclei from 83 embryos, precisely staged at 2- to 6-hour intervals spanning late gastrulation, annotating hundreds of cell types."
                              article2PdfPath="/pdf/mouse_atlas.pdf"
                         />
                    </ScrollFadeIn>

                    <ScrollFadeIn delay={200} duration={800} direction="up">
                         <NewsArticleLayout
                              title="Defining the determinants of protection against SARS-CoV-2 infection and viral control in a dose-down Ad26. CoV2. S vaccine study in nonhuman primates"
                              imagePath="/COVID_image.png"
                              pdfPath="/pdf/COVID_story.pdf"
                              githubUrl="https://github.com/dzhu8/Ad26-Dose-Down"
                              date="May 2nd, 2022"
                              journal="PLoS Biology"
                              mainContentFontSize={14}
                              secondaryContentFontSize={14}
                              article1ContentFontSize={14}
                              article2ContentFontSize={14}
                              fullText="Through a dose-down study in non-human primates (macaques), we found Fc effector function to be significantly correlated with mitigation of viral burden. The findings here suggested that vaccination strategies inducing broad functional antibodies would be important for long-term protection. The project that produced this paper was a good introduction to the world of systems biology and a great opportunity to apply statistical principles in practice. It was additionally fulfilling to work so closely to a world event that had a profound impact on my life for a long time (of course referring to the 2020 pandemic)."
                              article1Title="Related: Compromised Humoral Functional Evolution Tracks with SARS-CoV-2 Mortality"
                              article1Content="One of the first papers to deeply study the serological correlates of SARS-CoV-2 infection, finding IgG class switching timing to be very important."
                              article1PdfPath="/pdf/Zohar_et_al_2020.pdf"
                              article2Title="Related: Selective functional antibody transfer into the breastmilk after SARS-CoV-2 infection"
                              article2Content="A study of the extent, assessed from serological measurements, to which anti-SARS-CoV-2 immunity is transferred via breastmilk."
                              article2PdfPath="/pdf/Pullen_et_al_2021.pdf"
                         />
                    </ScrollFadeIn>

                    <ScrollFadeIn delay={200} duration={800} direction="up">
                         <NewsArticleLayout
                              title="Microtubule growth rates are sensitive to global and local changes in microtubule plus-end density"
                              imagePath="/MT_density.png"
                              pdfPath="/pdf/MT_density.pdf"
                              date="August 3rd, 2020"
                              journal="Current Biology"
                              mainContentFontSize={14}
                              secondaryContentFontSize={14}
                              article1ContentFontSize={14}
                              article2ContentFontSize={14}
                              fullText="We used microfluidics and photopatterning to design self-enclosed hydrogel containers that, when filled with the egg extract from Xenopus laevis, could be used to induce cell-free nucleation of microtubules. From this system, we analyzed the relationship between cytoplasmic volume and microtubule growth dynamics, finding that the density of microtubule plus ends and not cytoplasmic volume dictates microtubule growth rate. This project was my introduction to research in general. I still think it is quite beautiful to realize that these (and similar) complex pictures are constantly painted in our trillions of cells."
                              article1Title="Related: Changes in cytoplasmic volume are sufficient to drive spindle scaling"
                              article1Content="This study used a similar experimental setup to investigate the determinants of mitotic spindle sizing."
                              article1PdfPath="/pdf/spindle_size.pdf"
                              article2Title="Related: Dynamic instability of microtubule growth"
                              article2Content="The seminal study by Mitchison & Kirschner that established microtubules as dynamic structures."
                              article2PdfPath="/pdf/Mitchison_Kirschner_1984.pdf"
                         />
                    </ScrollFadeIn>
               </Section>

               <Section id="projects" title="Projects" craneScale={0.8} wingFlapSpeed={2.8} pathSpeed={11.0}>
                    <div className="space-y-12">
                         <ScrollFadeIn delay={100} duration={700} direction="right">
                              <TextEditWindow
                                   title="Spateo"
                                   imagePath="/Spateo_desc.png"
                                   languages={["python"]}
                                   content={`A bioinformatics platform. Spateo is a 3D spatiotemporal modeling framework that enables the creation of molecular holograms of whole embryos, allowing for the study of organ ecology at a molecular level in 3D space over time. Spateo enables scalable, 
                                        partial, non-rigid alignment, multi-slice refinement, and mesh correction to construct 3D holograms from sequential 2D slices. It also introduces digitization methods to uncover multi-level biology from subcellular to whole organ, identifying expression gradients 
                                        along arbitrary axes. It models intercellular communication to identify genes downstream of cell-cell interaction. Lastly, Spateo introduces "morphometric vector fields" of cell migration and integrates spatial differential geometry to unveil molecular programs 
                                        underlying this movement.`}
                              />
                         </ScrollFadeIn>
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
                         <ScrollFadeIn delay={100} duration={700} direction="left">
                              <CraneAnimatedProjectCard
                                   title="3D Animation Toolbox"
                                   languages={["javascript", "typescript"]}
                                   content={`A set of 3D asset objects and examples of animations involving 3D assets. Currently, includes basic particle animations (rain, snowflakes, fire, etc.), an interactive flock of birds, and an animation of origami cranes in flight (which was utilized in this website!). This is not yet complete; additional examples and usage tutorials will be added in the future.`}
                              />
                         </ScrollFadeIn>
                    </div>
               </Section>

               <Section
                    id="hobbies"
                    title="Hobbies"
                    subsections={[
                         {
                              id: "baking",
                              title: "Baking Sweet Treats",
                              children: (
                                   <ScrollFadeIn delay={200} duration={800} direction="up">
                                        <BakingContainer
                                             showDebugInfo={false}
                                             recipes={[
                                                  {
                                                       title: "Black Forest Cake",
                                                       imagePath: "/hobbies/black_forest.jpg",
                                                       description:
                                                            "A birthday cake for a friend. Chocolate sponge, cherry liqueur syrup, whipped cream, chocolate bark, pitted cherries and chocolate shavings.",
                                                  },
                                                  {
                                                       title: "Peppermint Pizzazz",
                                                       imagePath: "/hobbies/christmas_cake.jpg",
                                                       description:
                                                            "Chocolate espresso sponge, peppermint buttercream, dark chocolate ganache, candy cane brittle and white chocolate peppermint bark.",
                                                  },
                                                  {
                                                       title: "Hazelnut Symphony",
                                                       imagePath: "/hobbies/hazelnut_symphony.jpg",
                                                       description:
                                                            "No special occasion unless a love of Nutella counts as a special occasion. Chocolate sponge, hazelnut & almond streusel, hazelnut mousse, dark chocolate ganache, dark chocolate & Nutella shards, pecan shavings, Ferrero Rocher.",
                                                  },
                                                  {
                                                       title: "Oreo Domes",
                                                       imagePath: "/hobbies/oreo_domes.jpg",
                                                       description:
                                                            "Cookies & cream mousse hemispheres, Oreos (whole cookies and crumble), brownie round, vanilla mirror glaze, caramel syrup, lemon shavings, decorative Pirouette chocolate fudge wafer.",
                                                  },
                                                  {
                                                       title: "Ode to Reese's",
                                                       imagePath: "/hobbies/reeses_cake.jpg",
                                                       description:
                                                            "Even though I stopped trick-or-treating over a decade ago, I still like to put out candy for everyone else. One year I had enough leftover peanut butter cups to make a cake- chocolate sponge, peanut buttercream, milk chocolate ganache, decorative Reese's cups.",
                                                  },
                                                  {
                                                       title: "Yuletide on the Forest Floor",
                                                       imagePath: "/hobbies/yule_log.jpg",
                                                       description:
                                                            "Created for a holiday party! Chocolate genoise sponge, chocolate chestnut whipped cream, dark chocolate ganache, meringue mushrooms, cranberry, decorative rosemary, sugar and simple syrup.",
                                                  },
                                             ]}
                                        />
                                   </ScrollFadeIn>
                              ),
                         },
                         {
                              id: "cooking",
                              title: "Culinary Adventures",
                              children: (
                                   <ScrollFadeIn delay={200} duration={800} direction="up">
                                        <CookingContainer
                                             showDebugInfo={false}
                                             recipes={[
                                                  {
                                                       title: "Xīnnián Kuàilè (Happy New Year)",
                                                       titleFontSize: 24,
                                                       imagePath: "/hobbies/chinese_new_year.jpg",
                                                       description:
                                                            "A celebration of the Lunar New Year. Egg fried rice, pork potstickers, sweet potato puree, radish, pea shoots, pork char siu, panda-styled red bean bun, fried sesame balls with ube jam.",
                                                  },
                                                  {
                                                       title: "Soil, Sea and Sky",
                                                       titleFontSize: 24,
                                                       imagePath: "/hobbies/soil_sea_and_sky.jpg",
                                                       description:
                                                            "A dish that represents each of the highest-level ecological zones: terrestrial, marine and aerial! Honey garlic salmon, orzo, sirloin steak, broccolini, pea puree, king oyster mushroom, duck, toasted sesame, tomato pearls and a teriyaki sauce & parsley tree.",
                                                  },
                                                  {
                                                       title: "Elevated Thanksgiving",
                                                       titleFontSize: 24,
                                                       imagePath: "/hobbies/fancy_thanksgiving.jpg",
                                                       description:
                                                            "Decided to have fun on Friendsgiving with this elevated take on Thanksgiving dinner. Turkey roulade, mashed potatoes, potato pave, cranberry gel, assorted vegetables.",
                                                  },
                                                  {
                                                       title: "Mediterranean Medley",
                                                       titleFontSize: 24,
                                                       imagePath: "/hobbies/mediterranean.jpg",
                                                       description:
                                                            "A miscellaneous Mediterranean mashup! Falafel, pita crisps, tzatziki, yogurt, harissa tahini, pomegranate, mango chutney, cucumber slaw, and basmati rice.",
                                                  },
                                                  {
                                                       title: "KBBQ Plate",
                                                       titleFontSize: 24,
                                                       imagePath: "/hobbies/kbbq.jpg",
                                                       description:
                                                            "Galbi (Korean BBQ short rib), nasi goreng w/ fried egg, Chinese cabbage slaw with sweet & sour homemade Asian dressing.",
                                                  },
                                                  {
                                                       title: "Deconstructed Big Mac Meal",
                                                       titleFontSize: 24,
                                                       imagePath: "/hobbies/deconstructed_big_mac_meal.jpg",
                                                       description:
                                                            "Had some fun injecting a little flair into a staple of my childhood. NY strip steak, toasted sesame buns, butter lettuce, pickle, onion, `special sauce`, pommes puree, ketchup, Sprite in a wine glass (not pictured).",
                                                  },
                                             ]}
                                        />
                                   </ScrollFadeIn>
                              ),
                         },
                         {
                              id: "fitness",
                              title: "Running",
                              children: (
                                   <ScrollFadeIn delay={200} duration={800} direction="up">
                                        <StravaEmbedContainer
                                             showDebugInfo={false}
                                             description="No better way to clear your head and relax than with constant searing lung pain! Just kidding, kind of. I love endurance running and it's also my preferred mode of transit. It's my favorite way of exploring new places!"
                                             activities={[
                                                  {
                                                       id: "10165279936",
                                                       title: "Cambridge Half Marathon 2023",
                                                       style: "standard"
                                                  },
                                             ]}
                                        />
                                   </ScrollFadeIn>
                              ),
                         },
                    ]}
               />
          </main>
     );
}

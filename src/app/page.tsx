'use client';

import Hero from './components/hero/Hero';
import Navbar from './components/hero/Navbar';
import Section from './components/hero/Section';
import NewsArticleLayout from './components/subsections/ResearchNewspaperTemplate';
import TextEditWindow from './components/subsections/ProjectsTextEditorTemplate';

export default function Home() {
  return (
    <main>
      {/* Fixed navigation bar at the top */}
      <Navbar />
      
      {/* Hero Section with graph paper background */}
      <Hero />

      {/* Content Sections with white backgrounds */}
      <Section id="research" title="Research">
        <NewsArticleLayout 
          title="Spateo: Spatiotemporal modeling of molecular holograms"
          imagePath = "/Spateo.png"
          pdfPath = "/Spateo.pdf"
          githubUrl = "https://github.com/aristoteleo/spateo-release"
          date="November 11th, 2024"
          mainContentFontSize={14}
          secondaryContentFontSize={14}
          article1ContentFontSize={14}
          article2ContentFontSize={14}
          mainContent="Quantifying spatiotemporal dynamics during embryogenesis is crucial for understanding congenital diseases. We developed Spateo, a 3D spatiotemporal modeling framework, and applied it to a 3D mouse embryogenesis atlas at E9.5 and E11.5, capturing eight million cells. Spateo enables scalable, partial, non-rigid alignment, multi-slice refinement, and mesh correction to create molecular holograms of whole embryos. It introduces digitization methods to uncover multi-level biology from subcellular to whole organ, identifying expression gradients along orthogonal axes of emergent 3D structures, e.g., "
          secondaryContent="secondary organizers such as the zona limitans intrathalamica (ZLI). Spateo further jointly models intercellular and intracellular interaction to dissect signaling landscapes in 3D structures. Lastly, Spateo introduces “morphometric vector fields” of cell migration and integrates spatial differential geometry to unveil molecular programs underlying asymmetrical murine heart organogenesis and others, bridging macroscopic changes with molecular dynamics. Thus, Spateo enables the study of organ ecology at a molecular level in 3D space over time. From both a technological and intellectual perspective, this has been my most complex paper (and certainly the one that has taken the most time and effort!)"
          article1Title="Related: Mapping cells through space and time with moscot"
          article1Content="Introduces multi-omics single-cell optimal transport (moscot), a scalable framework for optimal transport in single-cell genomics. This can be used to align mouse cells across space and time."
          article1PdfPath="/pdf/moscot.pdf"
          article2Title="Related: A single-cell time-lapse of mouse prenatal development from gastrula to birth"
          article2Content="This study established a single-cell atlas spanning 12.4 million nuclei from 83 embryos, precisely staged at 2- to 6-hour intervals spanning late gastrulation, annotating hundreds of cell types."
          article2PdfPath="/pdf/mouse_atlas.pdf"
        />
      </Section>

      <Section id="projects" title="Projects">
        <TextEditWindow 
          title="JSMonitor"
          imagePath="/JS_monitor_logo.png"
          languages={["python"]}
          content={`A suite of terminal commands for quickly managing JavaScript/TypeScript project dependencies that I created out of pure laziness. Currently, this contains two tools: a dependency updater that fetches the latest versions of dependencies and devDependencies and installs them if outdated,
and an import scanner that checks codebases for import statements that are not yet installed. These packages are installed, and the package file is updated accordingly. Stay tuned for further updates!`}
        />
      </Section>

      <Section id="hobbies" title="Hobbies">
        {/* Hobbies content will be added later */}
      </Section>
    </main>
  );
}

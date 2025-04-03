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
          title="My Research Work"
          date="April 2, 2025"
          mainContent="My research primarily focuses on exploring innovative approaches to solve complex problems in the field. Through a combination of theoretical frameworks and practical experimentation, I've been working to develop new methodologies that can be applied across various domains."
          secondaryContent="Recent advancements in the field have opened up new avenues for exploration. I've been collaborating with researchers from different institutions to conduct cross-disciplinary studies that bridge traditional boundaries and create novel insights."
          article1Title="Latest Publication"
          article1Content="Our most recent paper, published in a prestigious journal, presents a comprehensive analysis of emerging trends and their implications for future research directions."
          article2Title="Ongoing Projects"
          article2Content="Currently, I'm involved in several projects that aim to extend our understanding of fundamental concepts and their applications in real-world scenarios."
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

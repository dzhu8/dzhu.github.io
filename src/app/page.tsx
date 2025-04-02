'use client';

import Hero from './components/hero/Hero';
import Navbar from './components/hero/Navbar';
import Section from './components/hero/Section';

export default function Home() {
  return (
    <main>
      {/* Fixed navigation bar at the top */}
      <Navbar />
      
      {/* Hero Section with graph paper background */}
      <Hero />

      {/* Content Sections with white backgrounds */}
      <Section id="research" title="Research">
        {/* Research content will be added later */}
      </Section>

      <Section id="projects" title="Projects">
        {/* Projects content will be added later */}
      </Section>

      <Section id="hobbies" title="Hobbies">
        {/* Hobbies content will be added later */}
      </Section>
    </main>
  );
}

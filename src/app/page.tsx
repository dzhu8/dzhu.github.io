"use client";

import Hero from "./components/hero/Hero";
import Navbar from "./components/hero/Navbar";

export default function Home() {
     return (
          <main>
               {/* Fixed navigation bar at the top */}
               <Navbar />

               {/* Hero Section with graph paper background */}
               <Hero />
          </main>
     );
}

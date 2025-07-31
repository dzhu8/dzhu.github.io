"use client";

import Hero from "./components/hero/Hero";
import Navbar from "./components/hero/Navbar";
import ScaleTracker from "./components/ScaleTracker";

export default function Home() {
     return (
          <main>
               {/* Scale Tracker for development/testing */}
               <ScaleTracker />

               {/* Fixed navigation bar at the top */}
               <Navbar />

               {/* Hero Section with graph paper background */}
               <Hero />
          </main>
     );
}

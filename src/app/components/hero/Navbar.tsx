"use client";

import { Home, BookOpen, Code, Sparkles } from "lucide-react";

export default function Navbar() {
     return (
          <nav className="navbar">
               <div className="container">
                    <div className="navbar-content">
                         <a href="#top" className="nav-item" aria-label="Home">
                              <Home size={18} />
                              <span>Home</span>
                         </a>
                         <a href="#research" className="nav-item" aria-label="Research">
                              <BookOpen size={18} />
                              <span>Research</span>
                         </a>
                         <a href="#projects" className="nav-item" aria-label="Projects">
                              <Code size={18} />
                              <span>Projects</span>
                         </a>
                         <a href="#hobbies" className="nav-item" aria-label="Hobbies">
                              <Sparkles size={18} />
                              <span>Hobbies</span>
                         </a>
                    </div>
               </div>
          </nav>
     );
}

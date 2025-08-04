"use client";

import { useEffect, useState } from "react";
import { Home, BookOpen, Code, Sparkles, Mail, Menu } from "lucide-react";

export default function Navbar() {
     const [isMobileMode, setIsMobileMode] = useState(false);
     const [isDropdownOpen, setIsDropdownOpen] = useState(false);

     useEffect(() => {
          const updateNavbarMode = () => {
               const currentWidth = window.innerWidth;
               const baseWidth = 2048;
               const scale = currentWidth / baseWidth;
               setIsMobileMode(scale < 0.4);

               // Close dropdown when switching modes
               if (scale >= 0.4) {
                    setIsDropdownOpen(false);
               }
          };

          const handleClickOutside = (event: MouseEvent) => {
               const target = event.target as Element;
               if (!target.closest(".navbar-dropdown") && !target.closest(".navbar-menu-button")) {
                    setIsDropdownOpen(false);
               }
          };

          // Initial check
          updateNavbarMode();

          // Listen for resize events
          window.addEventListener("resize", updateNavbarMode);

          // Listen for clicks outside dropdown
          document.addEventListener("click", handleClickOutside);

          return () => {
               window.removeEventListener("resize", updateNavbarMode);
               document.removeEventListener("click", handleClickOutside);
          };
     }, []);

     const toggleDropdown = () => {
          setIsDropdownOpen(!isDropdownOpen);
     };

     const navItems = [
          { href: "#top", icon: Home, label: "Home" },
          { href: "#research", icon: BookOpen, label: "Research" },
          { href: "#projects", icon: Code, label: "Projects" },
          { href: "#hobbies", icon: Sparkles, label: "Hobbies" },
          { href: "#contact", icon: Mail, label: "Contact Me (coming soon!)" },
     ];

     return (
          <nav className={`navbar ${isMobileMode ? "mobile-mode" : ""}`}>
               <div className="container">
                    <div className="navbar-content">
                         {!isMobileMode ? (
                              // Regular navbar items
                              navItems.map((item) => (
                                   <a key={item.href} href={item.href} className="nav-item" aria-label={item.label}>
                                        <item.icon size={18} />
                                        <span>{item.label}</span>
                                   </a>
                              ))
                         ) : (
                              // Mobile dropdown menu
                              <div style={{ position: "relative" }}>
                                   <button onClick={toggleDropdown} className="navbar-menu-button" aria-label="Menu">
                                        <Menu size={18} />
                                        <span>Menu</span>
                                   </button>

                                   <div className={`navbar-dropdown ${isDropdownOpen ? "open" : ""}`}>
                                        {navItems.map((item) => (
                                             <a
                                                  key={item.href}
                                                  href={item.href}
                                                  className="navbar-dropdown-item"
                                                  onClick={() => setIsDropdownOpen(false)}
                                             >
                                                  <item.icon size={16} />
                                                  <span>{item.label}</span>
                                             </a>
                                        ))}
                                   </div>
                              </div>
                         )}
                    </div>
               </div>
          </nav>
     );
}

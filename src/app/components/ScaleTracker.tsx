"use client";

import { useEffect, useState } from 'react';

export default function ScaleTracker() {
    const [scale, setScale] = useState(1);
    const [navbarScale, setNavbarScale] = useState(1);
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
        const updateScale = () => {
            const currentWidth = window.innerWidth;
            const baseWidth = 2048; // Base design width
            const rawScale = currentWidth / baseWidth;
            const minScale = 0.3; // Minimum scale factor to prevent text from being too small
            const calculatedScale = Math.max(rawScale, minScale);
            
            // Navbar scale factor: scales up but not down (minimum 1.0)
            const navbarScaleValue = Math.max(rawScale, 1.0);
            
            setViewportWidth(currentWidth);
            setScale(calculatedScale);
            setNavbarScale(navbarScaleValue);
            
            // Update CSS custom properties
            document.documentElement.style.setProperty('--scale-factor', calculatedScale.toString());
            document.documentElement.style.setProperty('--navbar-scale-factor', navbarScaleValue.toString());
        };

        // Initial calculation
        updateScale();

        // Listen for resize events
        window.addEventListener('resize', updateScale);

        return () => {
            window.removeEventListener('resize', updateScale);
        };
    }, []);

    return (
        <div className="scale-tracker">
            <div className="scale-info">
                <div className="scale-label">Scale Factor</div>
                <div className="scale-value">{scale.toFixed(3)}</div>
                <div className="viewport-info">
                    {viewportWidth}px / 2048px
                </div>
                <div className="viewport-info">
                    Font: {(scale * 100).toFixed(1)}% of base
                </div>
                <div className="viewport-info">
                    Navbar: {scale < 0.4 ? 'Mobile Menu' : `${(navbarScale * 100).toFixed(1)}%`}
                </div>
            </div>
        </div>
    );
}

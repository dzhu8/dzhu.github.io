"use client";

import { useEffect, useState } from 'react';

export default function ScaleTracker() {
    const [scale, setScale] = useState(1);
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
        const updateScale = () => {
            const currentWidth = window.innerWidth;
            const baseWidth = 2048; // Base design width
            const rawScale = currentWidth / baseWidth;
            const minScale = 0.3; // Minimum scale factor to prevent text from being too small
            const calculatedScale = Math.max(rawScale, minScale);
            
            setViewportWidth(currentWidth);
            setScale(calculatedScale);
            
            // Update CSS custom property
            document.documentElement.style.setProperty('--scale-factor', calculatedScale.toString());
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
            </div>
        </div>
    );
}

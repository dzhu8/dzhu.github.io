'use client';

import { useState, useEffect } from 'react';

interface HandwrittenTextProps {
  phrases: string[];
}

export default function HandwrittenText({ phrases }: HandwrittenTextProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Set up a timer to rotate through phrases
    const interval = setInterval(() => {
      // Trigger fade out
      setIsVisible(false);
      
      // After fade out, change phrase and fade in
      setTimeout(() => {
        setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        setIsVisible(true);
      }, 1000); // Wait for fade out animation to complete
      
    }, 5000); // Increased from 4000 to 5000 to allow time for the typing animation
    
    return () => clearInterval(interval);
  }, [phrases]);
  
  return (
    <div className="handwritten-container">
      <span className={`handwritten-text ${isVisible ? 'fade-in' : 'fade-out'}`}>
        {phrases[currentPhraseIndex]}
      </span>
    </div>
  );
}

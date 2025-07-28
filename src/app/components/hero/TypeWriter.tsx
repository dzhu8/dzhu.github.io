"use client";

import { useState, useEffect } from "react";

const words = ["Researcher", "Developer", "Designer"];

export default function TypeWriter() {
     const [text, setText] = useState("");
     const [wordIndex, setWordIndex] = useState(0);
     const [isDeleting, setIsDeleting] = useState(false);
     const [isPaused, setIsPaused] = useState(false);
     const [typingSpeed, setTypingSpeed] = useState(150);

     useEffect(() => {
          const currentWord = words[wordIndex];

          const timer = setTimeout(() => {
               // Handle pausing after full word is typed
               if (text === currentWord && !isDeleting) {
                    setIsPaused(true);
                    setTypingSpeed(2000); // 2 second pause
                    setTimeout(() => {
                         setIsPaused(false);
                         setIsDeleting(true);
                         setTypingSpeed(75); // Faster deletion
                    }, 2000);
                    return;
               }

               // If deleting
               if (isDeleting) {
                    setText(currentWord.substring(0, text.length - 1));

                    // When done deleting, move to next word
                    if (text.length === 1) {
                         setIsDeleting(false);
                         setWordIndex((wordIndex + 1) % words.length);
                         setTypingSpeed(150);
                    }
               } else {
                    // If typing
                    setText(currentWord.substring(0, text.length + 1));
               }
          }, typingSpeed);

          return () => clearTimeout(timer);
     }, [text, wordIndex, isDeleting, isPaused, typingSpeed]);

     return (
          <div className="typewriter-container">
               <span className="typewriter-text">{text}</span>
               <span className={`typewriter-cursor ${isPaused ? "blinking" : ""}`}>|</span>
          </div>
     );
}

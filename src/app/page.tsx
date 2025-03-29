import { useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // For path animation
    const paths = [];
    const maxPaths = 5;
    let animationFrameId;
    
    const generateRandomPath = () => {
      const path = {
        points: [],
        dashOffset: 1000,
        lifetime: 0,
        maxLifetime: Math.random() * 200 + 100,
        color: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 100}, ${Math.random() * 150 + 50}, 0.6)`
      };
      
      // Starting point
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      path.points.push({ x: startX, y: startY });
      
      // Generate random control points for curves
      const numPoints = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < numPoints; i++) {
        path.points.push({
          x: startX + Math.random() * 300 - 150,
          y: startY + Math.random() * 300 - 150
        });
      }
      
      return path;
    };
    
    const drawPaths = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create new paths if needed
      if (paths.length < maxPaths && Math.random() > 0.98) {
        paths.push(generateRandomPath());
      }
      
      // Draw and update each path
      for (let i = paths.length - 1; i >= 0; i--) {
        const path = paths[i];
        
        ctx.strokeStyle = path.color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        
        for (let j = 1; j < path.points.length; j++) {
          const prev = path.points[j-1];
          const curr = path.points[j];
          const next = path.points[j+1] || curr;
          
          // Create a bezier curve for smoother paths
          if (j < path.points.length - 1) {
            const cp1x = prev.x + (curr.x - prev.x) * 0.5;
            const cp1y = prev.y + (curr.y - prev.y) * 0.5;
            const cp2x = curr.x + (next.x - curr.x) * 0.5;
            const cp2y = curr.y + (next.y - curr.y) * 0.5;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
          } else {
            ctx.lineTo(curr.x, curr.y);
          }
        }
        
        // Apply drawing animation
        ctx.setLineDash([1000, 1000]);
        ctx.lineDashOffset = path.dashOffset;
        ctx.stroke();
        
        // Update path animation
        path.dashOffset -= 10;
        path.lifetime++;
        
        // Remove old paths
        if (path.lifetime > path.maxLifetime) {
          paths.splice(i, 1);
        }
      }
      
      animationFrameId = requestAnimationFrame(drawPaths);
    };
    
    drawPaths();
    
    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-[-1]" />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

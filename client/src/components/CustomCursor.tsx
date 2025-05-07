import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setTimeout(() => {
        setTrailPosition({ x: e.clientX, y: e.clientY });
      }, 80);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleElementInteraction = () => {
      const interactiveElements = document.querySelectorAll("button, input, a, li, textarea");
      
      interactiveElements.forEach(element => {
        element.addEventListener("mouseenter", () => setIsHovered(true));
        element.addEventListener("mouseleave", () => setIsHovered(false));
      });
      
      return () => {
        interactiveElements.forEach(element => {
          element.removeEventListener("mouseenter", () => setIsHovered(true));
          element.removeEventListener("mouseleave", () => setIsHovered(false));
        });
      };
    };
    
    handleElementInteraction();
  }, []);

  return (
    <>
      <motion.div
        ref={cursorRef}
        className="fixed w-3 h-3 bg-[var(--gold)] rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: position.x,
          y: position.y,
          width: isHovered ? 24 : isClicked ? 10 : 12,
          height: isHovered ? 24 : isClicked ? 10 : 12,
        }}
        transition={{
          duration: 0.1,
          ease: "linear"
        }}
      />
      <motion.div
        ref={trailRef}
        className="fixed w-1.5 h-1.5 bg-[var(--gold)] rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[9998] opacity-50"
        animate={{
          x: trailPosition.x,
          y: trailPosition.y,
        }}
        transition={{
          duration: 0.3,
          ease: "linear"
        }}
      />
    </>
  );
};

export default CustomCursor;

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Replace with your actual logo import or SVG
const Logo = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <rect width="80" height="80" rx="16" fill="#1A2E1A" />
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dy=".35em"
      fontSize="32"
      fill="#fff"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      Carter++
    </text>
  </svg>
);

const GRAIN_COLORS = ["#E2C290", "#D1B07C", "#C2A06B"];
const GRAIN_COUNT = 40;

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

const grains = Array.from({ length: GRAIN_COUNT }).map((_, i) => ({
  id: i,
  x: randomBetween(5, 95), // vw
  size: randomBetween(10, 22), // px
  duration: randomBetween(2.5, 4.5), // seconds
  delay: randomBetween(0, 1.5), // seconds
  rotate: randomBetween(-30, 30),
  color: GRAIN_COLORS[Math.floor(Math.random() * GRAIN_COLORS.length)],
  opacity: randomBetween(0.5, 0.9),
}));

const SplashScreen = ({ onFinish }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onFinish) onFinish();
      // else: use router navigation here if needed
    }, 4000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
          style={{
            background:
              "linear-gradient(135deg, #0a0f0a 0%, #1a2e1a 100%)",
            // Optional: subtle noise overlay
            // backgroundImage: "url('/noise.png'), linear-gradient(135deg, #0a0f0a 0%, #1a2e1a 100%)",
            // backgroundBlendMode: "overlay",
          }}
        >
          {/* Grain Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {grains.map((grain) => (
              <motion.div
                key={grain.id}
                initial={{
                  y: "-10%",
                  opacity: 0,
                  rotate: grain.rotate,
                }}
                animate={{
                  y: "110%",
                  opacity: grain.opacity,
                  rotate: grain.rotate + randomBetween(-10, 10),
                }}
                transition={{
                  duration: grain.duration,
                  delay: grain.delay,
                  ease: "linear",
                  repeat: Infinity,
                }}
                style={{
                  position: "absolute",
                  left: `${grain.x}vw`,
                  width: grain.size,
                  height: grain.size * 0.5,
                  background: grain.color,
                  borderRadius: "50% 60% 50% 60% / 60% 50% 60% 50%",
                  filter: "blur(0.2px)",
                  opacity: grain.opacity,
                  boxShadow: `0 0 4px 0 ${grain.color}33`,
                }}
              />
            ))}
          </div>

          {/* Logo Animation */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                delay: 2,
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
          >
            <Logo />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;

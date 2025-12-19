'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedLogo({ className = "" }: { className?: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`w-64 h-64 ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" 
                fill="url(#logoGradient)" fontSize="72" fontWeight="700" fontFamily="Inter, sans-serif">
            MS
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative w-64 h-64 ${className}`}>
      {/* Glow effect behind */}
      <motion.div
        className="absolute inset-0 blur-3xl opacity-30"
        animate={{
          background: [
            "radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
        <defs>
          {/* Main gradient */}
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          {/* Animated glow gradient */}
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <motion.stop
              offset="0%"
              animate={{ stopColor: ["#22d3ee", "#a855f7", "#22d3ee"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.stop
              offset="100%"
              animate={{ stopColor: ["#a855f7", "#22d3ee", "#a855f7"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </linearGradient>

          {/* Filter for glow */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Circuit pattern */}
          <pattern id="circuitPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="rgba(34,211,238,0.3)" />
          </pattern>
        </defs>

        {/* Background circle with circuit pattern */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="url(#mainGradient)"
          strokeWidth="1"
          strokeDasharray="5 5"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Inner decorative circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="rgba(34,211,238,0.2)"
          strokeWidth="0.5"
          initial={{ scale: 0.95 }}
          animate={{ scale: [0.95, 1, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main MS text */}
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="url(#mainGradient)"
          fontSize="72"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
          filter="url(#glow)"
        >
          MS
        </text>

        {/* Circuit lines - Top */}
        <motion.path
          d="M 60 40 L 60 30 L 100 30 L 100 20"
          stroke="url(#glowGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />

        <motion.path
          d="M 140 40 L 140 30 L 160 30 L 160 50"
          stroke="url(#glowGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />

        {/* Circuit lines - Bottom */}
        <motion.path
          d="M 60 160 L 60 170 L 40 170 L 40 150"
          stroke="url(#glowGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />

        <motion.path
          d="M 140 160 L 140 175 L 100 175 L 100 185"
          stroke="url(#glowGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        />

        {/* Circuit lines - Sides */}
        <motion.path
          d="M 30 100 L 20 100 L 20 80"
          stroke="url(#glowGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />

        <motion.path
          d="M 170 100 L 180 100 L 180 120"
          stroke="url(#glowGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
        />

        {/* Connection nodes */}
        {[
          { cx: 60, cy: 40 },
          { cx: 140, cy: 40 },
          { cx: 60, cy: 160 },
          { cx: 140, cy: 160 },
          { cx: 30, cy: 100 },
          { cx: 170, cy: 100 },
        ].map((pos, i) => (
          <motion.circle
            key={i}
            cx={pos.cx}
            cy={pos.cy}
            r="3"
            fill="#22d3ee"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}

        {/* Electric pulse effect on letters */}
        <motion.text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.5"
          fontSize="72"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          MS
        </motion.text>
      </svg>
    </div>
  );
}


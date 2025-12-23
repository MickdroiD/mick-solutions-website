'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AnimatedLogo({ className = "" }: { className?: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`w-64 h-64 flex items-center justify-center ${className}`}>
        <Image
          src="/logo.svg"
          alt="Mick Solutions"
          width={200}
          height={200}
          className="w-40 h-40"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-64 h-64 flex items-center justify-center ${className}`}>
      {/* Glow effect behind - uses CSS variables via Tailwind */}
      <motion.div
        className="absolute inset-0 blur-3xl opacity-30"
        animate={{
          background: [
            "radial-gradient(circle, var(--primary-400) 0%, transparent 70%)",
            "radial-gradient(circle, var(--accent-500) 0%, transparent 70%)",
            "radial-gradient(circle, var(--primary-400) 0%, transparent 70%)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Animated circles around the logo */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
        <defs>
          {/* Main gradient - uses CSS variables */}
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--primary-400)' }} />
            <stop offset="50%" style={{ stopColor: 'var(--primary-500)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--accent-500)' }} />
          </linearGradient>

          {/* Animated glow gradient */}
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <motion.stop
              offset="0%"
              animate={{ stopColor: ["var(--primary-400)", "var(--accent-500)", "var(--primary-400)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.stop
              offset="100%"
              animate={{ stopColor: ["var(--accent-500)", "var(--primary-400)", "var(--accent-500)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </linearGradient>
        </defs>

        {/* Background circle with rotation */}
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
          className="stroke-primary-400/20"
          strokeWidth="0.5"
          initial={{ scale: 0.95 }}
          animate={{ scale: [0.95, 1, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

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

        {/* Connection nodes - uses CSS variable */}
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
            className="fill-primary-400"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </svg>

      {/* Main Logo Image */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src="/logo.svg"
          alt="Mick Solutions"
          width={140}
          height={140}
          className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 drop-shadow-[0_0_30px_var(--primary-400)]"
        />
        
        {/* Pulse glow effect on logo */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 20px color-mix(in srgb, var(--primary-400) 20%, transparent)",
              "0 0 40px color-mix(in srgb, var(--accent-500) 30%, transparent)",
              "0 0 20px color-mix(in srgb, var(--primary-400) 20%, transparent)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const floatingElements = Array.from({ length: 20 }, (_, i) => i);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: [0, 0.5, 0],
      y: [-50, 50],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.3), transparent 50%)',
            'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.3), transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.3), transparent 50%)',
            'radial-gradient(circle at 0% 100%, rgba(59, 130, 246, 0.3), transparent 50%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Floating orbs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 pointer-events-none"
      >
        {floatingElements.map((i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              background: `radial-gradient(circle at 30% 30%, 
                ${i % 3 === 0 ? 'rgba(168, 85, 247, 0.2)' : i % 3 === 1 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)'},
                transparent)`,
            }}
          />
        ))}
      </motion.div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default AnimatedBackground;

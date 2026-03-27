'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  rotation?: number;
}

export function FloatingCard({ children, delay = 0, rotation = 0 }: FloatingCardProps) {
  return (
    <motion.div
      className="rounded-xl backdrop-blur-md bg-white/5 border border-white/10 p-6"
      initial={{ opacity: 0, y: 20, rotate: rotation }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      whileHover={{ y: -10, shadow: '0 20px 40px rgba(0,0,0,0.3)' }}
      transition={{
        duration: 0.6,
        delay,
        type: 'spring',
        stiffness: 100,
      }}
      animate={{
        y: [0, -10, 0],
      }}
      whileAnimationComplete={{
        y: [0, -10, 0],
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gradient';
  disabled?: boolean;
  className?: string;
}

export function AnimatedButton({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  className = '',
}: AnimatedButtonProps) {
  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-700',
    secondary: 'bg-slate-700 hover:bg-slate-600',
    gradient: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-3 rounded-lg text-white font-semibold transition-all ${
        variantClasses[variant]
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
}

interface Animated3DTitleProps {
  text: string;
  className?: string;
}

export function Animated3DTitle({ text, className = '' }: Animated3DTitleProps) {
  return (
    <motion.h1
      className={`text-5xl md:text-6xl font-bold ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
        {text}
      </span>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 blur-xl -z-10 opacity-30"
        animate={{
          x: [-20, 20, -20],
          y: [-10, 10, -10],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.h1>
  );
}

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({ children, className = '' }: GradientTextProps) {
  return (
    <span className={`bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

interface AnimatedIconProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
}

export function AnimatedIcon({ children, size = 24, color = 'white' }: AnimatedIconProps) {
  return (
    <motion.div
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ width: size, height: size }}
    >
      <div style={{ color: color }}>{children}</div>
    </motion.div>
  );
}

export default {
  FloatingCard,
  AnimatedButton,
  Animated3DTitle,
  GradientText,
  AnimatedIcon,
};

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  delay?: number;
  className?: string;
  layout?: boolean | string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ delay = 0, className = '', layout = false }) => {
  return (
    <motion.div
      layout={layout}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        type: 'tween', 
        ease: [0.22, 1, 0.36, 1], 
        duration: 0.3, 
        delay 
      }}
      className={`relative overflow-hidden bg-neutral-900/60 border border-orange-700/30 rounded-br-xl rounded-tl-xl rounded-tr-sm rounded-bl-sm ${className}`}
      style={{
        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.05), inset -1px -1px 0 rgba(0,0,0,0.3)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.04%22/%3E%3C/svg%3E")'
      }}
    >
      {/* Copper Laser Sweep */}
      <motion.div
        className="absolute inset-y-0 left-0 w-[20%] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent blur-md"
        animate={{
          left: ['-50%', '150%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
          delay: delay // Offset laser sweep slightly based on index
        }}
      />
    </motion.div>
  );
};

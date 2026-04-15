import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import type { Phase } from '../types';
import { MOCK_COMMAND } from '../data/mockData';
import { useOrbPosition } from '../hooks/useOrbPosition';

interface AgentWidgetProps {
  phase: Phase;
  onExpand: () => void;
  onSubmit: (prompt: string) => void;
}

export const AgentWidget: React.FC<AgentWidgetProps> = ({ phase, onExpand, onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const { x, y, controls, onDragEnd, snapToBestCorner } = useOrbPosition();

  const isOrb = phase === 'idle' || phase === 'complete';
  const isExpanded = phase === 'expand';
  const isHidden = phase === 'loading' || phase === 'synthesis';

  // After synthesis complete, measure layout and move to clearest corner
  useEffect(() => {
    if (phase === 'complete') {
      // Small delay so layout panels have all painted
      const id = setTimeout(() => snapToBestCorner('[data-layout-panel]'), 100);
      return () => clearTimeout(id);
    }
  }, [phase, snapToBestCorner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSubmit(inputValue);
  };

  const handleOrbClick = () => {
    if (isOrb) {
      onExpand();
      // Remove MOCK_COMMAND auto-fill to allow free typing
    }
  };

  if (isHidden) return null;

  if (isExpanded) {
    // Input bar: centered at current orb position, fixed bottom
    return (
      <AnimatePresence>
        <motion.form
          key="input-bar"
          onSubmit={handleSubmit}
          className="fixed left-1/2 bottom-12 z-50 flex items-center rounded-full backdrop-blur-xl border border-cyan-400/50 overflow-hidden relative"
          style={{
            translateX: '-50%',
            width: '600px',
            maxWidth: '90vw',
            background: 'linear-gradient(90deg, rgba(0,255,255,0.05) 0%, rgba(176,0,255,0.05) 100%)',
            boxShadow: '0 0 40px rgba(176,0,255,0.3), 0 0 80px rgba(0,255,255,0.1)',
          }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          {/* Liquid mercury reflection highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          <div className="pl-6 pr-3 py-4 flex items-center justify-center relative z-10">
            <Sparkles className="text-cyan-400 w-5 h-5" />
          </div>

          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter directive..."
            className="flex-1 bg-transparent border-none outline-none text-cyan-50 placeholder-cyan-700/50 py-4 px-2 font-mono text-sm relative z-10"
            spellCheck={false}
          />

          <button
            type="submit"
            className="mr-2 p-3 rounded-full hover:bg-white/10 transition-colors relative z-10 text-purple-400 hover:text-cyan-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </motion.form>
      </AnimatePresence>
    );
  }

  // Orb — freely draggable, snaps to corners on release
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragEnd={onDragEnd}
      animate={controls}
      style={{ x, y, position: 'fixed', top: 0, left: 0, zIndex: 50 }}
      whileDrag={{ scale: 1.1, boxShadow: '0 0 60px rgba(0,255,255,0.6), 0 0 120px rgba(176,0,255,0.5)' }}
    >
      <motion.div
        className="w-16 h-16 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center backdrop-blur-md border border-cyan-400/30 select-none"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,255,0.15), rgba(176,0,255,0.15))',
        }}
        onClick={handleOrbClick}
        animate={{
          boxShadow: [
            '0 0 20px rgba(0,255,255,0.4)',
            '0 0 40px rgba(176,0,255,0.6)',
            '0 0 20px rgba(0,255,255,0.4)',
          ],
          y: [0, -6, 0],
        }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        <Sparkles className="text-cyan-300 w-6 h-6 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
};

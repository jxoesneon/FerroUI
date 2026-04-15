import { useState, useCallback } from 'react';
import type { Phase } from '../types';

export function usePhaseOrchestrator() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');

  const triggerExpand = useCallback(() => {
    setPhase('expand');
  }, []);

  const triggerInputFinished = useCallback((prompt: string) => {
    setCurrentPrompt(prompt);
    setPhase('loading'); // Show skeletons
    
    // After 1.5s, skeletons snap to real components
    setTimeout(() => {
      setPhase('synthesis');
      
      // And the agent collapses back to orb slightly later
      setTimeout(() => {
        setPhase('complete');
      }, 500);
    }, 1500);
  }, []);

  // Helper to allow resetting the demo
  const reset = useCallback(() => {
    setPhase('idle');
  }, []);

  return { phase, currentPrompt, setPhase, triggerExpand, triggerInputFinished, reset };
}

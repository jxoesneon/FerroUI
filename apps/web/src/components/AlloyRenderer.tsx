import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlloyComponent } from '@alloy/schema';
import { registry } from '@alloy/registry';
import { AlloyErrorBoundary } from './ErrorBoundary';
import { actionRouter } from '../services/ActionRouter';

interface AlloyRendererProps {
  component: AlloyComponent;
}

/**
 * Recursive Alloy UI Renderer.
 * Implements Section 8.3: Atomic Component Hierarchy & Section 8.4: Framer Motion Animations.
 */
export const AlloyRenderer: React.FC<AlloyRendererProps> = ({ component }) => {
  const { type, id, props, children, action, aria } = component;

  // Resolve component implementation from the registry
  const entry = useMemo(() => registry.getComponentEntry(type), [type]);

  if (!entry) {
    return (
      <div className="p-2 border border-yellow-500 bg-yellow-50 text-yellow-800">
        Missing Component: <strong>{type}</strong>
      </div>
    );
  }

  const ComponentImplementation = entry.component;

  // Handle component-level actions
  const handleClick = action
    ? async () => {
        await actionRouter.dispatch(action);
      }
    : undefined;

  return (
    <AlloyErrorBoundary name={type}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={handleClick}
        className={action ? "cursor-pointer" : ""}
        role={aria?.role}
        aria-label={aria?.label}
        aria-labelledby={aria?.labelledBy}
        aria-describedby={aria?.describedBy}
        aria-hidden={aria?.hidden}
        aria-live={aria?.live}
      >
        <ComponentImplementation {...props}>
          <AnimatePresence mode="popLayout">
            {children?.map((child, index) => (
              <AlloyRenderer key={child.id || `${type}-child-${index}`} component={child} />
            ))}
          </AnimatePresence>
        </ComponentImplementation>
      </motion.div>
    </AlloyErrorBoundary>
  );
};

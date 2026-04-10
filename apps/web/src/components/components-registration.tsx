import React from 'react';
import { z } from 'zod';
import { ComponentTier } from '@alloy/schema';
import { registerComponent } from '@alloy/registry';

/**
 * Dashboard Component (Root)
 */
export const Dashboard: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="dashboard min-h-screen bg-gray-100 p-8">
    <header className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900">Alloy UI Dashboard</h1>
    </header>
    <main className="grid grid-cols-1 gap-6">
      {children}
    </main>
  </div>
);

registerComponent({
  name: 'Dashboard',
  version: 1,
  tier: ComponentTier.ORGANISM,
  component: Dashboard,
  schema: z.object({
    children: z.any().optional(),
  }),
});

/**
 * Section Component
 */
export const Section: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <section className="section bg-white rounded-xl shadow-md p-6">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
    <div className="section-content">
      {children}
    </div>
  </section>
);

registerComponent({
  name: 'Section',
  version: 1,
  tier: ComponentTier.ORGANISM,
  component: Section,
  schema: z.object({
    title: z.string(),
    children: z.any().optional(),
  }),
});

/**
 * Card Component
 */
export const Card: React.FC<{ title: string; content?: string; children?: React.ReactNode }> = ({ title, content, children }) => (
  <div className="card border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
    <h3 className="text-xl font-medium text-gray-700 mb-2">{title}</h3>
    {content && <p className="text-gray-600 mb-4">{content}</p>}
    <div className="card-actions mt-4">
      {children}
    </div>
  </div>
);

registerComponent({
  name: 'Card',
  version: 1,
  tier: ComponentTier.MOLECULE,
  component: Card,
  schema: z.object({
    title: z.string(),
    content: z.string().optional(),
    children: z.any().optional(),
  }),
});

/**
 * Button Component
 */
export const Button: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
  <button
    className="btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    onClick={onClick}
  >
    {label}
  </button>
);

registerComponent({
  name: 'Button',
  version: 1,
  tier: ComponentTier.ATOM,
  component: Button,
  schema: z.object({
    label: z.string(),
    onClick: z.any().optional(),
  }),
});

/**
 * Text Component
 */
export const Text: React.FC<{ value: string; size?: 'sm' | 'md' | 'lg' }> = ({ value, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };
  return <p className={sizeClasses[size]}>{value}</p>;
};

registerComponent({
  name: 'Text',
  version: 1,
  tier: ComponentTier.ATOM,
  component: Text,
  schema: z.object({
    value: z.string(),
    size: z.enum(['sm', 'md', 'lg']).optional(),
  }),
});

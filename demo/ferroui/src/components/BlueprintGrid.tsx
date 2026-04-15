import React from 'react';

export const BlueprintGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#050505]">
      {/* Base Grid */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundSize: '100px 100px',
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
        }}
      />
      {/* Subdivision Grid */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundSize: '20px 20px',
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
        }}
      />
      {/* PCB Intersection nodes */}
      <div className="absolute inset-0"
        style={{
          backgroundSize: '100px 100px',
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 3px, transparent 4px)
          `
        }}
      />
    </div>
  );
};

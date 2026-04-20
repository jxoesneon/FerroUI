import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhaseOrchestrator } from './hooks/usePhaseOrchestrator';

import { BlueprintGrid } from './components/BlueprintGrid';
import { AgentWidget } from './components/AgentWidget';
import { KPIBoard } from './components/KPIBoard';
import { DataTable } from './components/DataTable';
import { ChartPanel } from './components/ChartPanel';
import { Skeleton } from './components/Skeleton';
import type { ComponentType, LayoutComponent } from './types';

/**
 * Derive which panels to show from the prompt keywords.
 * The actual data for each panel comes from the engine via engineData.
 */
function deriveLayout(prompt: string): LayoutComponent[] {
  const p = prompt.toLowerCase();

  if (p.includes('network') || p.includes('proxy') || p.includes('table')) {
    if (p.includes('latency') || p.includes('chart')) {
      return [
        { id: 'table', colSpan: 'col-span-1 lg:col-span-8' },
        { id: 'chart', colSpan: 'col-span-1 lg:col-span-4' },
      ];
    }
    return [{ id: 'table', colSpan: 'col-span-1 lg:col-span-12' }];
  }

  if (p.includes('latency') || p.includes('performance') || p.includes('chart')) {
    return [
      { id: 'kpi',   colSpan: 'col-span-1 lg:col-span-12' },
      { id: 'chart', colSpan: 'col-span-1 lg:col-span-12' },
    ];
  }

  if (p.includes('kpi') || p.includes('metrics') || p.includes('overview') || p.includes('system') || p.includes('cpu')) {
    return [{ id: 'kpi', colSpan: 'col-span-1 lg:col-span-12' }];
  }

  return [
    { id: 'kpi',   colSpan: 'col-span-1 lg:col-span-12' },
    { id: 'table', colSpan: 'col-span-1 lg:col-span-8' },
    { id: 'chart', colSpan: 'col-span-1 lg:col-span-4' },
  ];
}

function App() {
  const { phase, currentPrompt, engineData, triggerExpand, triggerInputFinished } = usePhaseOrchestrator();

  const isSynthesized = phase === 'synthesis' || phase === 'complete';
  const isLoading = phase === 'loading';

  const targetLayoutSchema = React.useMemo(() => deriveLayout(currentPrompt), [currentPrompt]);

  const [renderedComponents, setRenderedComponents] = React.useState<
    { id: ComponentType; colSpan: string; status: 'loading' | 'ready' }[]
  >([]);

  React.useEffect(() => {
    setRenderedComponents((prev) =>
      targetLayoutSchema.map((targetNode) => {
        const existedBefore = prev.find((p) => p.id === targetNode.id);
        return {
          id: targetNode.id,
          colSpan: targetNode.colSpan,
          status: existedBefore ? existedBefore.status : 'loading',
        };
      })
    );
  }, [targetLayoutSchema]);

  React.useEffect(() => {
    if (phase === 'synthesis' || phase === 'complete') {
      setRenderedComponents((prev) => prev.map((c) => ({ ...c, status: 'ready' })));
    }
  }, [phase]);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-neutral-300 overflow-x-hidden font-mono selection:bg-cyan-900/50 selection:text-cyan-100">
      <BlueprintGrid />

      <div className="relative z-10 p-6 md:p-10 w-full h-full max-w-6xl mx-auto flex flex-col gap-6 min-h-screen">
        <header className="mb-6 flex justify-between items-end border-b border-amber-600/20 pb-4">
          <div>
            <h1
              className="text-2xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700 uppercase"
              style={{ textShadow: '0 0 20px rgba(217,119,6,0.3)' }}
            >
              FERRO_UI // RUNTIME
            </h1>
          </div>
          <div className="flex gap-4 text-[10px] uppercase tracking-[0.3em]">
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">SYS:</span>
              <span className="text-amber-600">ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">STATE:</span>
              <span className={isSynthesized ? 'text-cyan-400' : isLoading ? 'text-amber-500' : 'text-neutral-500'}>
                {phase.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 w-full relative pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            <AnimatePresence>
              {phase !== 'idle' &&
                phase !== 'expand' &&
                renderedComponents.map((widget) => {
                  const isWidgetLoading = widget.status === 'loading';
                  return (
                    <motion.div
                      layout
                      key={widget.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className={widget.colSpan}
                    >
                      {isWidgetLoading ? (
                        widget.id === 'kpi' ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-[120px]">
                            <Skeleton delay={0} className="h-full" layout />
                            <Skeleton delay={0.1} className="h-full" layout />
                            <Skeleton delay={0.2} className="h-full" layout />
                          </div>
                        ) : (
                          <Skeleton delay={0} className="h-[300px] w-full" layout />
                        )
                      ) : widget.id === 'kpi' ? (
                        <KPIBoard metrics={engineData.metrics} />
                      ) : widget.id === 'table' ? (
                        <DataTable connections={engineData.connections} prompt={currentPrompt} />
                      ) : (
                        <ChartPanel timeSeries={engineData.timeSeries} />
                      )}
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AgentWidget phase={phase} onExpand={triggerExpand} onSubmit={triggerInputFinished} />
    </div>
  );
}

export default App;

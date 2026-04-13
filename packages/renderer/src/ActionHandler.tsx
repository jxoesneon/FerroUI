import React, { useCallback } from 'react';
import type { Action } from '@alloy/schema';

export interface ActionHandlerProps {
  children: React.ReactNode;
  onNavigate?: (path: string, params?: Record<string, unknown>) => void;
  onToast?: (message: string, variant: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  onRefresh?: (payload?: Record<string, unknown>) => void;
  onToolCall?: (tool: string, args: Record<string, unknown>) => void;
}

/**
 * ActionHandler wraps the renderer tree and intercepts `data-alloy-action`
 * click events, dispatching them to the appropriate handler.
 */
export const ActionHandler: React.FC<ActionHandlerProps> = ({
  children,
  onNavigate,
  onToast,
  onRefresh,
  onToolCall,
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-alloy-action]');
      if (!target) return;

      const raw = target.getAttribute('data-alloy-action');
      if (!raw) return;

      try {
        const action: Action = JSON.parse(raw);

        switch (action.type) {
          case 'NAVIGATE':
            e.preventDefault();
            onNavigate?.(action.payload.path, action.payload.params as Record<string, unknown> | undefined);
            break;

          case 'SHOW_TOAST':
            onToast?.(action.payload.message, action.payload.variant, action.payload.duration);
            break;

          case 'REFRESH':
            onRefresh?.(action.payload as Record<string, unknown> | undefined);
            break;

          case 'TOOL_CALL':
            onToolCall?.(action.payload.tool, action.payload.args as Record<string, unknown>);
            break;
        }
      } catch {
        // Invalid action JSON — ignore
      }
    },
    [onNavigate, onToast, onRefresh, onToolCall],
  );

  return (
    <div onClick={handleClick} role="presentation">
      {children}
    </div>
  );
};

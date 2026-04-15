import React, { useCallback } from 'react';
import { ActionSchema } from '@ferroui/schema';
import type { Action } from '@ferroui/schema';

export interface ActionHandlerProps {
  children: React.ReactNode;
  onNavigate?: (path: string, params?: Record<string, unknown>) => void;
  onToast?: (message: string, variant: 'info' | 'success' | 'warning' | 'error', duration?: number) => void;
  onRefresh?: (payload?: Record<string, unknown>) => void;
  onToolCall?: (tool: string, args: Record<string, unknown>) => void;
  onStateUpdate?: (componentId: string, newState: string) => void;
}

/**
 * ActionHandler wraps the renderer tree and intercepts `data-ferroui-action`
 * click events, dispatching them to the appropriate handler.
 */
export const ActionHandler: React.FC<ActionHandlerProps> = ({
  children,
  onNavigate,
  onToast,
  onRefresh,
  onToolCall,
  onStateUpdate,
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-ferroui-action]');
      if (!target) return;

      const raw = target.getAttribute('data-ferroui-action');
      if (!raw) return;

      try {
        const rawAction = JSON.parse(raw);
        const action = ActionSchema.parse(rawAction);

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

          case 'STATE_UPDATE':
            onStateUpdate?.(action.payload.id, JSON.stringify(action.payload.state));
            break;
        }
      } catch (err) {
        console.error('ActionHandler: Invalid action schema', err);
      }
    },
    [onNavigate, onToast, onRefresh, onToolCall, onStateUpdate],
  );

  return (
    <div onClick={handleClick} role="presentation">
      {children}
    </div>
  );
};

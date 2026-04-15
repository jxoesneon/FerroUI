import type { Action } from '@ferroui/schema';

export interface ActionRouterContext {
  refresh: () => void;
  showToast: (message: string, variant: 'info' | 'success' | 'warning' | 'error') => void;
  navigate: (path: string, params?: Record<string, unknown>) => void;
}

/**
 * Global Action Router for FerroUI UI.
 * Handles Section 2.3 Actions: NAVIGATE, SHOW_TOAST, REFRESH, TOOL_CALL.
 */
export class ActionRouter {
  private static instance: ActionRouter;
  private context: ActionRouterContext | null = null;

  private constructor() {}

  public static getInstance(): ActionRouter {
    if (!ActionRouter.instance) {
      ActionRouter.instance = new ActionRouter();
    }
    return ActionRouter.instance;
  }

  /**
   * Set the runtime context for the router.
   */
  public setContext(context: ActionRouterContext): void {
    this.context = context;
  }

  /**
   * Dispatches an action to the appropriate handler.
   */
  public async dispatch(action: Action): Promise<void> {
    if (!this.context) {
      console.warn('ActionRouter: Context not set. Action ignored.', action);
      return;
    }

    const { type, payload } = action;

    switch (type) {
      case 'NAVIGATE':
        this.context.navigate(payload.path, payload.params);
        break;

      case 'SHOW_TOAST':
        this.context.showToast(payload.message, payload.variant);
        break;

      case 'REFRESH':
        this.context.refresh();
        break;

      case 'TOOL_CALL':
        await this.handleToolCall(payload.tool, payload.args);
        break;

      default:
        console.warn(`ActionRouter: Unhandled action type: ${(action as any).type}`);
    }
  }

  /**
   * Handles TOOL_CALL actions by executing the specified tool.
   */
  private async handleToolCall(tool: string, args: Record<string, unknown>): Promise<void> {
    console.log(`Executing tool: ${tool}`, args);
    
    try {
      const response = await fetch('/api/tools/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tool, args }),
      });

      if (!response.ok) {
        throw new Error(`Tool call failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Tool call result:`, result);
      
      // Usually, tool calls trigger a refresh to reflect state changes
      this.context?.refresh();
    } catch (error) {
      console.error('Error executing tool call:', error);
      this.context?.showToast(`Tool call failed: ${tool}`, 'error');
    }
  }
}

export const actionRouter = ActionRouter.getInstance();

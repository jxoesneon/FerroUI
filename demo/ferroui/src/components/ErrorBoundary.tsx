import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Strict Error Boundary for FerroUI UI components.
 * Ensures Section 8.4: Component Isolation and Fault Tolerance.
 */
export class FerroUIErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in component '${this.props.name || 'Unknown'}':`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded-md">
            <h3 className="text-lg font-bold">Component Error</h3>
            <p className="text-sm">Failed to render component: {this.props.name}</p>
            {this.state.error && (
              <pre className="mt-2 text-xs overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

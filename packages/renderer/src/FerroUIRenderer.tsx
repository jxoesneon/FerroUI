import React, { useMemo, useState, useEffect } from 'react';
import type { FerroUIComponent } from '@ferroui/schema';
import { registry } from '@ferroui/registry';

export interface FerroUIRendererProps {
  /** The FerroUILayout root component tree to render. */
  layout: FerroUIComponent;
  /** Optional fallback component when a type is not found in the registry. */
  fallback?: React.ComponentType<{ type: string; props?: Record<string, unknown> }>;
  /** Optional override map: type → React component (takes priority over registry). */
  overrides?: Record<string, React.ComponentType<any>>;
}

/**
 * Default fallback for unknown component types.
 */
const DefaultFallback: React.FC<{ type: string }> = ({ type }) => (
  <div
    role="alert"
    style={{ padding: '8px 12px', border: '1px dashed #d93025', borderRadius: 4, color: '#d93025', fontSize: 13 }}
  >
    Unknown component: <code>{type}</code>
  </div>
);

/**
 * Resolves a React component for a given FerroUIComponent type.
 * Priority: overrides → registry → fallback.
 */
function resolveComponent(
  type: string,
  overrides?: Record<string, React.ComponentType<any>>,
  fallback?: React.ComponentType<{ type: string; props?: Record<string, unknown> }>,
): React.ComponentType<any> {
  // 1. Check overrides first
  if (overrides?.[type]) return overrides[type];

  // 2. Check registry
  const entry = registry.getComponentEntry(type);
  if (entry) return entry.component;

  // 3. Fallback
  return fallback ?? DefaultFallback;
}

/**
 * Recursively renders an FerroUIComponent tree.
 */
const RenderNode: React.FC<{
  node: FerroUIComponent;
  overrides?: Record<string, React.ComponentType<any>>;
  fallback?: React.ComponentType<{ type: string; props?: Record<string, unknown> }>;
  path?: string;
}> = ({ node, overrides, fallback, path = 'root' }) => {
  // --- State Machine Runtime (RFC-001) ---
  const [currentState, setCurrentState] = useState(node.stateMachine?.initial);

  // Listen for state update events for this component
  useEffect(() => {
    if (!node.id) return;
    
    const handleStateUpdate = (e: any) => {
      const { componentId, newState } = e.detail;
      if (componentId === node.id && node.stateMachine?.states[newState]) {
        setCurrentState(newState);
      }
    };

    window.addEventListener('ferroui-state-update', handleStateUpdate);
    return () => window.removeEventListener('ferroui-state-update', handleStateUpdate);
  }, [node.id, node.stateMachine]);

  const activeNode = useMemo(() => {
    if (node.stateMachine && currentState) {
      const stateDef = node.stateMachine.states[currentState];
      return stateDef?.render ?? node;
    }
    return node;
  }, [node, currentState]);

  const Component = resolveComponent(activeNode.type, overrides, fallback);

  // Build props: merge node.props + aria + action + id
  const componentProps: Record<string, unknown> = {
    ...activeNode.props,
    key: activeNode.id ?? path,
  };

  // Pass ARIA props if present
  if (activeNode.aria) {
    if (activeNode.aria.label) componentProps['aria-label'] = activeNode.aria.label;
    if (activeNode.aria.labelledBy) componentProps['aria-labelledby'] = activeNode.aria.labelledBy;
    if (activeNode.aria.describedBy) componentProps['aria-describedby'] = activeNode.aria.describedBy;
    if (activeNode.aria.hidden !== undefined) componentProps['aria-hidden'] = activeNode.aria.hidden;
    if (activeNode.aria.live) componentProps['aria-live'] = activeNode.aria.live;
    if (activeNode.aria.role) componentProps['role'] = activeNode.aria.role;
  }

  // Pass action as a data attribute for the action handler layer
  if (activeNode.action) {
    componentProps['data-ferroui-action'] = JSON.stringify(activeNode.action);
  }

  // For unknown components, pass the type so the fallback can display it
  if (!registry.getComponentEntry(activeNode.type) && !overrides?.[activeNode.type]) {
    componentProps['type'] = activeNode.type;
  }

  // Recursively render children
  const children = activeNode.children?.map((child: FerroUIComponent, index: number) => (
    <RenderNode
      key={child.id ?? `${path}.${index}`}
      node={child}
      overrides={overrides}
      fallback={fallback}
      path={`${path}.${index}`}
    />
  ));

  return <Component {...componentProps}>{children}</Component>;
};

/**
 * FerroUIRenderer — the core layout renderer.
 *
 * Takes an FerroUILayout root component and recursively renders it
 * using the component registry, with optional overrides and fallback.
 *
 * @example
 * ```tsx
 * <FerroUIRenderer layout={ferrouiLayout.layout} />
 * ```
 */
export const FerroUIRenderer: React.FC<FerroUIRendererProps> = ({ layout, fallback, overrides }) => {
  const memoizedOverrides = useMemo(() => overrides, [overrides]);

  return (
    <div className="ferroui-renderer" data-ferroui-root>
      <RenderNode node={layout} overrides={memoizedOverrides} fallback={fallback} />
    </div>
  );
};

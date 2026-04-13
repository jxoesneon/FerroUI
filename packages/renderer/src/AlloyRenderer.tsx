import React, { useMemo } from 'react';
import type { AlloyComponent } from '@alloy/schema';
import { registry } from '@alloy/registry';

export interface AlloyRendererProps {
  /** The AlloyLayout root component tree to render. */
  layout: AlloyComponent;
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
 * Resolves a React component for a given AlloyComponent type.
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
 * Recursively renders an AlloyComponent tree.
 */
const RenderNode: React.FC<{
  node: AlloyComponent;
  overrides?: Record<string, React.ComponentType<any>>;
  fallback?: React.ComponentType<{ type: string; props?: Record<string, unknown> }>;
  path?: string;
}> = ({ node, overrides, fallback, path = 'root' }) => {
  const Component = resolveComponent(node.type, overrides, fallback);

  // Build props: merge node.props + aria + action + id
  const componentProps: Record<string, unknown> = {
    ...node.props,
    key: node.id ?? path,
  };

  // Pass ARIA props if present
  if (node.aria) {
    if (node.aria.label) componentProps['aria-label'] = node.aria.label;
    if (node.aria.labelledBy) componentProps['aria-labelledby'] = node.aria.labelledBy;
    if (node.aria.describedBy) componentProps['aria-describedby'] = node.aria.describedBy;
    if (node.aria.hidden !== undefined) componentProps['aria-hidden'] = node.aria.hidden;
    if (node.aria.live) componentProps['aria-live'] = node.aria.live;
    if (node.aria.role) componentProps['role'] = node.aria.role;
  }

  // Pass action as a data attribute for the action handler layer
  if (node.action) {
    componentProps['data-alloy-action'] = JSON.stringify(node.action);
  }

  // For unknown components, pass the type so the fallback can display it
  if (!registry.getComponentEntry(node.type) && !overrides?.[node.type]) {
    componentProps['type'] = node.type;
  }

  // Recursively render children
  const children = node.children?.map((child, index) => (
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
 * AlloyRenderer — the core layout renderer.
 *
 * Takes an AlloyLayout root component and recursively renders it
 * using the component registry, with optional overrides and fallback.
 *
 * @example
 * ```tsx
 * <AlloyRenderer layout={alloyLayout.layout} />
 * ```
 */
export const AlloyRenderer: React.FC<AlloyRendererProps> = ({ layout, fallback, overrides }) => {
  const memoizedOverrides = useMemo(() => overrides, [overrides]);

  return (
    <div className="alloy-renderer" data-alloy-root>
      <RenderNode node={layout} overrides={memoizedOverrides} fallback={fallback} />
    </div>
  );
};

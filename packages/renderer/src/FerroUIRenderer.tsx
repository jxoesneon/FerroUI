import React, { useMemo, useState, useEffect } from 'react';
import type { FerroUIComponent, FerroUILayout, LayoutMetadata } from '@ferroui/schema';
import { registry } from '@ferroui/registry';

export interface FerroUIRendererProps {
  /** The root layout object or root component tree. */
  layout: FerroUIComponent | FerroUILayout;
  /** Optional metadata if passing only the component tree. */
  metadata?: LayoutMetadata;
  /** If true, enables signature verification. */
  strictProvenance?: boolean;
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
 * Signature verification badge.
 */
const ProvenanceBadge: React.FC<{ verified: boolean | null }> = ({ verified }) => {
  if (verified === null) return null;

  return (
    <div 
      className={`ferroui-provenance-badge ${verified ? 'verified' : 'unverified'}`}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        fontSize: '10px',
        padding: '2px 6px',
        borderRadius: '12px',
        backgroundColor: verified ? '#e6fffa' : '#fff5f5',
        color: verified ? '#2c7a7b' : '#c53030',
        border: `1px solid ${verified ? '#38b2ac' : '#feb2b2'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        zIndex: 10,
        fontWeight: 600,
        pointerEvents: 'none'
      }}
    >
      <span style={{ fontSize: '12px' }}>{verified ? '✓' : '⚠'}</span>
      {verified ? 'Provenance Verified' : 'Provenance Unverified'}
    </div>
  );
};

/**
 * Browser-compatible signature verification using Web Crypto API.
 */
async function verifyLayoutSignature(layout: FerroUILayout): Promise<boolean> {
  const { metadata } = layout;
  if (!metadata?.signature || !metadata?.publicKey) return false;

  try {
    // 1. Prepare data (remove signature/publicKey from metadata to match engine signing)
    const dataToVerify = {
      ...layout,
      metadata: {
        ...metadata,
        signature: undefined,
        publicKey: undefined,
      }
    };
    const encodedData = new TextEncoder().encode(JSON.stringify(dataToVerify));

    // 2. Prepare Public Key (strip PEM headers)
    const pem = metadata.publicKey;
    const rawPublicKey = pem
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\s/g, '');
    
    // b64 to binary
    const binaryPublicKey = Uint8Array.from(atob(rawPublicKey), c => c.charCodeAt(0));
    const binarySignature = Uint8Array.from(atob(metadata.signature), c => c.charCodeAt(0));

    // 3. Import Key
    const cryptoKey = await window.crypto.subtle.importKey(
      'spki',
      binaryPublicKey,
      { name: 'Ed25519' },
      true,
      ['verify']
    );

    // 4. Verify
    return await window.crypto.subtle.verify(
      { name: 'Ed25519' },
      cryptoKey,
      binarySignature,
      encodedData
    );
  } catch (err) {
    console.error('[FerroUI] Signature verification error:', err);
    return false;
  }
}

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

const isFullLayout = (layout: any): layout is FerroUILayout => {
  return layout && layout.requestId !== undefined && layout.layout !== undefined;
};

/**
 * FerroUIRenderer — the core layout renderer.
 *
 * Takes an FerroUILayout root component and recursively renders it
 * using the component registry, with optional overrides and fallback.
 *
 * @example
 * ```tsx
 * <FerroUIRenderer layout={ferrouiLayout} strictProvenance />
 * ```
 */
export const FerroUIRenderer: React.FC<FerroUIRendererProps> = ({ 
  layout, 
  metadata: metadataProp,
  strictProvenance,
  fallback, 
  overrides 
}) => {
  const memoizedOverrides = useMemo(() => overrides, [overrides]);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const fullLayout = useMemo(() => {
    if (isFullLayout(layout)) return layout;
    return {
      schemaVersion: '1.1.0',
      requestId: '00000000-0000-0000-0000-000000000000',
      locale: 'en-US',
      layout: layout as FerroUIComponent,
      metadata: metadataProp
    } as FerroUILayout;
  }, [layout, metadataProp]);

  useEffect(() => {
    if (!strictProvenance) {
      setIsVerified(null);
      return;
    }

    if (fullLayout.metadata?.signature && fullLayout.metadata?.publicKey) {
      verifyLayoutSignature(fullLayout).then(setIsVerified);
    } else {
      setIsVerified(false);
    }
  }, [fullLayout, strictProvenance]);

  return (
    <div className="ferroui-renderer" data-ferroui-root style={{ position: 'relative' }}>
      {strictProvenance && <ProvenanceBadge verified={isVerified} />}
      <RenderNode node={fullLayout.layout} overrides={memoizedOverrides} fallback={fallback} />
    </div>
  );
};

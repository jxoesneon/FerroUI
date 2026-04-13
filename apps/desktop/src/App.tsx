import React, { useEffect, useState } from 'react';
import { useAlloyLayout } from '../../web/src/hooks/useAlloyLayout';
import { AlloyRenderer } from '../../web/src/components/AlloyRenderer';
import { actionRouter, type ActionRouterContext } from '../../web/src/services/ActionRouter';
import '../../web/src/components/components-registration';
import '../../web/src/App.css';

interface Toast {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
}

function App() {
  const { layout, loading, error, refresh } = useAlloyLayout({
    url: 'http://localhost:3001/api/layout', // Desktop app connects to local engine
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Configure the Action Router context
  useEffect(() => {
    const context: ActionRouterContext = {
      refresh,
      showToast: (message: string, variant: any) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, variant }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
      },
      navigate: (path: string, params?: any) => {
        console.log('Navigating to:', path, params);
      },
    };

    actionRouter.setContext(context);
  }, [refresh]);

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-6 border border-red-200">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Engine Connection Error</h1>
          <p className="text-red-600 mb-6">{error.message}</p>
          <button
            onClick={refresh}
            className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="alloy-app min-h-screen relative">
      {/* Main Layout Rendering */}
      {layout?.layout && <AlloyRenderer component={layout.layout as any} />}

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-full px-4 py-2 flex items-center space-x-2 border border-blue-200">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm font-medium text-blue-800">Streaming Layout...</span>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-xl text-white font-medium animate-bounce-in ${
              toast.variant === 'error' ? 'bg-red-600' :
              toast.variant === 'success' ? 'bg-green-600' :
              toast.variant === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

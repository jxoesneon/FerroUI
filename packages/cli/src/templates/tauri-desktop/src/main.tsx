import React from 'react';
import ReactDOM from 'react-dom/client';
import { FerroUIRenderer } from '@ferroui/renderer';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <div className="tauri-app">
      <h1>FerroUI Desktop</h1>
      {/* Renderer usage */}
    </div>
  </React.StrictMode>
);

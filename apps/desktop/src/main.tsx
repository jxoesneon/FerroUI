import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../src/App.js' // Assuming we can reuse web App or create a desktop one
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

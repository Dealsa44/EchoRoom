import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add error handling for app initialization
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback error display
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: system-ui;">
      <h2>App Loading Error</h2>
      <p>Please refresh the page or try again later.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin: 10px;">Refresh</button>
    </div>
  `;
}

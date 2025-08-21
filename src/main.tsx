import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// iOS Safari compatibility fix
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// Add error handling for app initialization
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// iOS Safari specific initialization
if (isIOS) {
  // Ensure DOM is fully ready on iOS
  document.addEventListener('DOMContentLoaded', () => {
    // Force a small delay to ensure proper rendering
    setTimeout(() => {
      initializeApp();
    }, 100);
  });
} else {
  initializeApp();
}

function initializeApp() {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error('Failed to render app:', error);
    // Fallback error display
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui; background: #f8f9fa; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="max-width: 400px;">
          <h2 style="color: #333; margin-bottom: 16px;">App Loading Error</h2>
          <p style="color: #666; margin-bottom: 20px;">Please refresh the page or try again later.</p>
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">Refresh Page</button>
        </div>
      </div>
    `;
  }
}

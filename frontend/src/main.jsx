import React from 'react';
import ReactDOM from 'react-dom/client';
import AppComprehensive from './App.comprehensive';

console.log('🚀 LifeLink Frontend Starting...');
console.log('📦 Loading comprehensive LifeLink system with all modules...');

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element #root not found in DOM');
  }
  console.log('✅ Root element found');
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AppComprehensive />
    </React.StrictMode>
  );
  
  console.log('✅ LifeLink app rendered successfully');
  console.log('🎉 You should see the login page now!');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  console.error('Stack:', error.stack);
  document.body.innerHTML = `
    <div style="padding:40px;font-family:monospace;max-width:800px;margin:50px auto;">
      <h1 style="color:#ef4444;margin-bottom:20px;">❌ Failed to Load LifeLink</h1>
      <div style="background:#fee2e2;padding:20px;border-radius:8px;margin-bottom:20px;">
        <strong>Error:</strong> ${error.message}
      </div>
      <details style="background:#f3f4f6;padding:20px;border-radius:8px;">
        <summary style="cursor:pointer;font-weight:bold;margin-bottom:10px;">Stack Trace</summary>
        <pre style="overflow:auto;font-size:12px;">${error.stack || 'No stack trace available'}</pre>
      </details>
    </div>
  `;
}

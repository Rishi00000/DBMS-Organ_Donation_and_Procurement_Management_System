import React from 'react';
import ReactDOM from 'react-dom/client';
import AppTest from './App.test';

console.log('🚀 Testing React...');

const root = document.getElementById('root');
if (!root) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found');
  try {
    ReactDOM.createRoot(root).render(<AppTest />);
    console.log('✅ React test app rendered');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

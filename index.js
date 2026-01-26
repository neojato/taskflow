import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

const h = React.createElement;
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  h(React.StrictMode, null, 
    h(App)
  )
);
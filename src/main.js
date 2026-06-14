import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import './i18n';
const root = document.getElementById('root');
ReactDOM.createRoot(root).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsx(App, {}) }) }));
// Hide the HTML loader once React has painted
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        window.__hideLoader?.();
    });
});

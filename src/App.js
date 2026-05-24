import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import MapPage from './pages/MapPage';
import ObjectPage from './pages/ObjectPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(WelcomePage, {}) }), _jsx(Route, { path: "/map", element: _jsx(MapPage, {}) }), _jsx(Route, { path: "/object/:id", element: _jsx(ObjectPage, {}) }), _jsx(Route, { path: "/nfc/:nfcId", element: _jsx(ObjectPage, {}) }), _jsx(Route, { path: "/qr/:qrCode", element: _jsx(ObjectPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }));
}

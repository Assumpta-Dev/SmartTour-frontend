import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LocationPage from './pages/LocationPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ObjectPage from './pages/ObjectPage';
import AdminPage from './pages/AdminPage';
import GPSPage from './pages/GPSPage';
import NotFoundPage from './pages/NotFoundPage';
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/locations/:slug", element: _jsx(LocationPage, {}) }), _jsx(Route, { path: "/items/:slug", element: _jsx(ItemDetailPage, {}) }), _jsx(Route, { path: "/object/:id", element: _jsx(ObjectPage, {}) }), _jsx(Route, { path: "/nfc/:nfcId", element: _jsx(ObjectPage, {}) }), _jsx(Route, { path: "/qr/:qrCode", element: _jsx(ObjectPage, {}) }), _jsx(Route, { path: "/gps", element: _jsx(GPSPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }));
}

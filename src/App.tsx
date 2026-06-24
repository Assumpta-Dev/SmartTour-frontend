import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout        from './components/layout/MainLayout';
import HomePage          from './pages/HomePage';
import AllLocationsPage  from './pages/AllLocationsPage';
import LocationPage      from './pages/LocationPage';
import CategoryPage      from './pages/CategoryPage';
import AllItemsPage      from './pages/AllItemsPage';
import ItemDetailPage    from './pages/ItemDetailPage';
import ObjectPage        from './pages/ObjectPage';
import AdminPage         from './pages/AdminPage';
import GPSPage           from './pages/GPSPage';
import NotFoundPage      from './pages/NotFoundPage';

export default function App() {
  const location = useLocation();
  const isGPSPage    = location.pathname === '/gps';
  const isAdminPage   = location.pathname === '/admin';

  const content = (
    <Routes>
      <Route path="/"                  element={<HomePage />} />
      <Route path="/locations"         element={<AllLocationsPage />} />
      <Route path="/locations/:slug"   element={<LocationPage />} />
      <Route path="/category/:slug"    element={<CategoryPage />} />
      <Route path="/items"             element={<AllItemsPage />} />
      <Route path="/items/:slug"       element={<ItemDetailPage />} />
      <Route path="/object/:id"        element={<ObjectPage />} />
      <Route path="/nfc/:nfcId"        element={<ObjectPage />} />
      <Route path="/qr/:qrCode"        element={<ObjectPage />} />
      <Route path="/gps"               element={<GPSPage />} />
      <Route path="/admin"             element={<AdminPage />} />
      <Route path="*"                  element={<NotFoundPage />} />
    </Routes>
  );

  if (isGPSPage || isAdminPage) return content;

  return <MainLayout>{content}</MainLayout>;
}

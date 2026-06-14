import { Routes, Route } from 'react-router-dom';
import HomePage       from './pages/HomePage';
import LocationPage   from './pages/LocationPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ObjectPage     from './pages/ObjectPage';
import AdminPage      from './pages/AdminPage';
import GPSPage        from './pages/GPSPage';
import NotFoundPage   from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<HomePage />} />
      <Route path="/locations/:slug" element={<LocationPage />} />
      <Route path="/items/:slug"     element={<ItemDetailPage />} />
      <Route path="/object/:id"      element={<ObjectPage />} />
      <Route path="/nfc/:nfcId"      element={<ObjectPage />} />
      <Route path="/qr/:qrCode"      element={<ObjectPage />} />
      <Route path="/gps"             element={<GPSPage />} />
      <Route path="/admin"           element={<AdminPage />} />
      <Route path="*"                element={<NotFoundPage />} />
    </Routes>
  );
}

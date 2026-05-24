import { Routes, Route } from 'react-router-dom';
import WelcomePage  from './pages/WelcomePage';
import MapPage      from './pages/MapPage';
import ObjectPage   from './pages/ObjectPage';
import AdminPage    from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/"              element={<WelcomePage />} />
      <Route path="/map"           element={<MapPage />} />
      <Route path="/object/:id"    element={<ObjectPage />} />
      <Route path="/nfc/:nfcId"    element={<ObjectPage />} />
      <Route path="/qr/:qrCode"    element={<ObjectPage />} />
      <Route path="/admin"         element={<AdminPage />} />
      <Route path="*"              element={<NotFoundPage />} />
    </Routes>
  );
}

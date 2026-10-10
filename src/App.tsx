import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import TextPage from './pages/TextPage';
import CardsPage from './pages/CardsPage';
import SentencesPage from './pages/SentencesPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/text" replace />} />
        <Route path="text" element={<TextPage />} />
        <Route path="cards" element={<CardsPage />} />
        <Route path="sentences/:word?" element={<SentencesPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/text" replace />} />
      </Route>
    </Routes>
  );
}

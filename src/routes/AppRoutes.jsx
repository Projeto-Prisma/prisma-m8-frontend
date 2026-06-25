import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import Mapa from '../pages/Mapa/Mapa';
import Denuncias from '../pages/Denuncias/Denuncias';
import DenunciaDetalhe from '../pages/Denuncias/DenunciaDetalhe';
import Orgaos from '../pages/Orgaos/Orgaos';
import Notificacoes from '../pages/Notificacoes/Notificacoes';
import Login from '../pages/Login/Login';
import Home from '../pages/Portal/Home';
import Denunciar from '../pages/Denunciar/Denunciar';
import Acompanhar from '../pages/Acompanhar/Acompanhar';

export default function AppRoutes({ isAuthenticated, onLogin, onLogout }) {
  const requireAuth = (element) =>
    isAuthenticated ? element : <Navigate to="/login" replace />;

  return (
    <Routes>
      {/* Portal público do cidadão (sem autenticação, sem sidebar) */}
      <Route path="/portal" element={<Home />} />
      <Route path="/denunciar" element={<Denunciar />} />
      <Route path="/acompanhar" element={<Acompanhar />} />

      {/* Área restrita da gestão */}
      <Route path="/login" element={<Login isAuthenticated={isAuthenticated} onLogin={onLogin} />} />
      <Route path="/" element={requireAuth(<Dashboard />)} />
      <Route path="/mapa" element={requireAuth(<Mapa />)} />
      <Route path="/denuncias" element={requireAuth(<Denuncias />)} />
      <Route path="/denuncias/:proto" element={requireAuth(<DenunciaDetalhe />)} />
      <Route path="/orgaos" element={requireAuth(<Orgaos />)} />
      <Route path="/notificacoes" element={requireAuth(<Notificacoes />)} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
}

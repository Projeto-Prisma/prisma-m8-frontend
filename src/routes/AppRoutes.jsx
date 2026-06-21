import { Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard/Dashboard';
import Mapa from '../pages/Mapa/Mapa';
import Denuncias from '../pages/Denuncias/Denuncias';
import DenunciaDetalhe from '../pages/Denuncias/DenunciaDetalhe';
import Orgaos from '../pages/Orgaos/Orgaos';
import Notificacoes from '../pages/Notificacoes/Notificacoes';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/denuncias" element={<Denuncias />} />
      <Route path="/denuncias/:proto" element={<DenunciaDetalhe />} />
      <Route path="/orgaos" element={<Orgaos />} />
      <Route path="/notificacoes" element={<Notificacoes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import AppRoutes from './routes/AppRoutes';

function AppContent({ isAuthenticated, onLogin, onLogout }) {
  const location = useLocation();
  const showLayout = location.pathname !== '/login';

  return showLayout ? (
    <AppLayout onLogout={onLogout}>
      <AppRoutes isAuthenticated={isAuthenticated} onLogin={onLogin} />
    </AppLayout>
  ) : (
    <AppRoutes isAuthenticated={isAuthenticated} onLogin={onLogin} />
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <AppContent
        isAuthenticated={isAuthenticated}
        onLogin={() => setIsAuthenticated(true)}
        onLogout={() => setIsAuthenticated(false)}
      />
    </BrowserRouter>
  );
}

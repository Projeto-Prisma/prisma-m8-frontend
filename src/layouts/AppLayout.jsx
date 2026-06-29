import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import { fetchNotificacoes, normalizarNotificacao } from '../services/m6Service';
import './AppLayout.css';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/mapa', label: 'Mapa', icon: 'map' },
  { to: '/denuncias', label: 'Denúncias', icon: 'megaphone' },
  { to: '/orgaos', label: 'Órgãos Públicos', icon: 'building' },
  { to: '/notificacoes', label: 'Notificações', icon: 'bell' },
];

export function useNotificacoes() {
  const [naoLidas, setNaoLidas] = useState(0);

  const carregar = () => {
    fetchNotificacoes(50)
      .then((lista) => {
        const normalized = Array.isArray(lista) ? lista.map(normalizarNotificacao) : [];
        setNaoLidas(normalized.filter((n) => !n.lida).length);
      })
      .catch(() => setNaoLidas(0));
  };

  return { naoLidas, carregar };
}

export default function AppLayout({ children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { naoLidas, carregar } = useNotificacoes();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    carregar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refaz o fetch ao navegar (detecta mudança de rota)
  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      carregar();
    }
  }); // sem dep array: roda após cada render, mas só chama carregar() quando pathname muda

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Logo width={28} height={28} />
          </span>
          <span className="brand-text">
            <strong>Prisma Recife</strong>
            <small>Ouvidoria · Painel</small>
          </span>
        </div>

        <nav className="nav" aria-label="Navegação principal">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
              {item.to === '/notificacoes' && naoLidas > 0 && (
                <span className="nav-badge tnum">{naoLidas}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <span className="user-avatar" aria-hidden="true">OR</span>
            <span className="user-meta">
              <strong>Equipe Ouvidoria</strong>
              <small>Prefeitura do Recife</small>
            </span>
          </div>
          <button
            className="logout-btn"
            type="button"
            title="Sair (mockado)"
            onClick={() => {
              onLogout?.();
              navigate('/login');
            }}
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="main-inner">{children}</div>
      </main>
    </div>
  );
}

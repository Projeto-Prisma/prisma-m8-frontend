import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import { notificacoes } from '../data/mockNotificacoes';
import './AppLayout.css';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/mapa', label: 'Mapa', icon: 'map' },
  { to: '/denuncias', label: 'Denúncias', icon: 'megaphone' },
  { to: '/orgaos', label: 'Órgãos Públicos', icon: 'building' },
  { to: '/notificacoes', label: 'Notificações', icon: 'bell' },
];

export default function AppLayout({ children, onLogout }) {
  const naoLidas = notificacoes.filter((n) => !n.lida).length;
  const navigate = useNavigate();

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

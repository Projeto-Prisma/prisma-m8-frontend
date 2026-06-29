import { useEffect, useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import Logo from '../../components/Logo';
import { mockUser } from '../../data/mockUser';
import logoConecta from '../../assets/logo_conecta_recife.png';
import logoEstado from '../../assets/logo_estado.png';
import './Login.css';

export default function Login({ isAuthenticated, onLogin }) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPwd]  = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!error) return undefined;
    const t = window.setTimeout(() => setError(''), 4000);
    return () => window.clearTimeout(t);
  }, [error]);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 600));
    if (email.toLowerCase() === mockUser.email && password === mockUser.password) {
      onLogin();
      navigate('/');
      return;
    }
    setLoading(false);
    setError('Usuário ou senha inválidos.');
  };

  const fillDemo = () => {
    setEmail(mockUser.email);
    setPassword(mockUser.password);
    setError('');
  };

  return (
    <div className="lp-root">
      {/* ── fundo ── */}
      <div className="lp-bg" aria-hidden="true">
        <div className="lp-orb lp-orb--blue" />
        <div className="lp-orb lp-orb--orange" />
        <div className="lp-dots" />
      </div>

      <div className="lp-shell">
        {/* ── coluna de marca ── */}
        <aside className="lp-brand">
          {/* radar */}
          <div className="lp-radar" aria-hidden="true">
            <div className="lp-ring lp-ring--1" />
            <div className="lp-ring lp-ring--2" />
            <div className="lp-ring lp-ring--3" />
            <div className="lp-sweep" />
            <div className="lp-logo-wrap">
              <Logo width={56} height={56} />
            </div>
          </div>

          <div className="lp-brand-text">
            <p className="lp-brand-name"><strong>PRISMA</strong> <span>Recife</span></p>
            <h2 className="lp-brand-headline">Monitoramento urbano em tempo real</h2>
            <p className="lp-brand-sub">
              Painel de triagem inteligente de denúncias para gestores municipais.
            </p>
          </div>

          <ul className="lp-features" aria-label="Funcionalidades">
            <li className="lp-pill">
              <span className="lp-pill-icon">⚡</span>
              Triagem automática por IA
            </li>
            <li className="lp-pill">
              <span className="lp-pill-icon">🗺️</span>
              Mapa de criticidade ao vivo
            </li>
            <li className="lp-pill">
              <span className="lp-pill-icon">🔔</span>
              Notificações multicanal
            </li>
            <li className="lp-pill">
              <span className="lp-pill-icon">📊</span>
              Analytics e recorrência territorial
            </li>
          </ul>

          <div className="lp-status" aria-label="Status do sistema">
            <span className="lp-status-dot" />
            Sistema operacional · monitoramento ao vivo
          </div>
        </aside>

        {/* ── coluna de formulário ── */}
        <main className="lp-form-col">
          <div className="lp-card">
            <div className="lp-card-bar" aria-hidden="true" />

            <div className="lp-card-body">
              <h1 className="lp-card-title">Entrar</h1>
              <p className="lp-card-sub">Informe suas credenciais institucionais.</p>

              <form onSubmit={handleSubmit} className="lp-form" noValidate>
                <label className="lp-field">
                  <span className="lp-label">Usuário</span>
                  <div className="lp-input-wrap">
                    <Icon name="user" size={17} className="lp-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="gestao@recife.pe.gov.br"
                      required
                      autoComplete="username"
                    />
                  </div>
                </label>

                <label className="lp-field">
                  <span className="lp-label">Senha</span>
                  <div className="lp-input-wrap">
                    <Icon name="lock" size={17} className="lp-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      required
                      autoComplete="current-password"
                      aria-label="Senha"
                    />
                    <button
                      type="button"
                      className="lp-pwd-toggle"
                      onClick={() => setShowPwd((v) => !v)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} size={17} />
                    </button>
                  </div>
                </label>

                <div className="lp-error-slot" aria-live="polite">
                  {error && (
                    <div className="lp-error">
                      <Icon name="alert" size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="lp-btn-primary"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? <span className="lp-spinner" aria-hidden="true" /> : null}
                  {loading ? 'Entrando…' : 'Entrar'}
                </button>

                <button
                  type="button"
                  className="lp-btn-demo"
                  onClick={fillDemo}
                  disabled={loading}
                >
                  Usar credenciais de demonstração
                </button>
              </form>

              <div className="lp-card-footer">
                <Link to="/portal" className="lp-back-link">← Voltar ao portal público</Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── rodapé institucional ── */}
      <footer className="lp-footer">
        <img src={logoConecta} alt="Conecta Recife" className="lp-footer-logo" />
        <div className="lp-footer-divider" aria-hidden="true" />
        <img src={logoEstado}  alt="Governo de Pernambuco" className="lp-footer-logo" />
      </footer>
    </div>
  );
}

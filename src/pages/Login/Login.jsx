import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import Logo from '../../components/Logo';
import { mockUser } from '../../data/mockUser';
import './Login.css';

export default function Login({ isAuthenticated, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!error) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setError('');
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [error]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (email.toLowerCase() === mockUser.email && password === mockUser.password) {
      onLogin();
      navigate('/');
      return;
    }

    setError('Usuário ou senha inválidos.');
  };

  return (
    <>
    <div className="login-page">
      <aside className="login-panel-info">
        <div className="login-hero-logo">
          <Logo width={56} height={56} />
        </div>
        <div className="login-branding">
          <strong>PRISMA</strong>
          <span>Recife</span>
        </div>
        <div className="login-hero-copy">
          <h2>Área restrita da gestão</h2>
          <p>
            Painel de monitoramento e triagem inteligente de denúncias urbanas.
            Acesso exclusivo para gestores municipais.
          </p>
        </div>
        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature-dot blue" />
            <p>Triagem automática por IA</p>
          </div>
          <div className="login-feature">
            <span className="login-feature-dot orange" />
            <p>Mapa de criticidade em tempo real</p>
          </div>
          <div className="login-feature">
            <span className="login-feature-dot purple" />
            <p>Gestão de pendências de classificação</p>
          </div>
        </div>
      </aside>

      <main className="login-panel-form">
        <div className="login-card">
          <h1>Entrar</h1>
          <p>Informe suas credenciais institucionais.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <label>
              <span>Usuário</span>
              <div className="login-input-group">
                <Icon name="user" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex.: seugmail.com"
                  required
                />
              </div>
            </label>
            <label>
              <span>Senha</span>
              <div className="login-input-group login-password-group">
                <Icon name="lock" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  aria-label="Senha"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
            </label>
            {error && (
              <div className="login-error">
                <Icon name="alert" size={18} />
                <span>{error}</span>
              </div>
            )}
            <button type="submit" className="login-submit">
              Entrar
            </button>
          </form>
          <div className="login-bottom">
            <a href="#" className="login-back">← Voltar ao portal público</a>
          </div>
        </div>
      </main>
    </div>
    <footer className="login-global-footer">
      <img src="/src/assets/logo_conecta_recife.png" alt="Conecta Recife" className="login-footer-logo" />
      <img src="/src/assets/logo_estado.png" alt="Governo de Pernambuco" className="login-footer-logo" />
    </footer>
  </>
  );
}

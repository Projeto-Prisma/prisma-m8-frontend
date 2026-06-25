import { Link } from 'react-router-dom';
import Icon from './Icon';
import './PublicTopbar.css';

// Barra superior do portal público (Conecta Recife).
// - `accessibility`: mostra a faixa de acessibilidade acima da navegação
// - `center`: bloco de navegação central (opcional)
// - `actions`: ações à direita (opcional)
// - `subtitle`: exibe a segunda linha da marca (versão "alta" da Home)
export default function PublicTopbar({ accessibility = false, center, actions, subtitle = false }) {
  return (
    <>
      {accessibility && (
        <div className="pub-a11y">
          <span className="pub-a11y-label">Acessibilidade:</span>
          <button type="button" className="pub-a11y-btn">
            <Icon name="contrast" size={14} /> Alto Contraste
          </button>
          <button type="button" className="pub-a11y-btn">
            <Icon name="hand" size={14} /> VLibras
          </button>
        </div>
      )}

      <nav className={`pub-topbar ${subtitle ? 'is-tall' : ''}`}>
        <Link to="/portal" className="pub-brand">
          <span className="pub-brand-mark" aria-hidden="true">CR</span>
          <span className="pub-brand-text">
            <strong>Conecta Recife</strong>
            {subtitle && <small>Tratamento Inteligente de Denúncias</small>}
          </span>
        </Link>

        {center && <div className="pub-topbar-center">{center}</div>}

        {actions && <div className="pub-topbar-actions">{actions}</div>}
      </nav>
    </>
  );
}

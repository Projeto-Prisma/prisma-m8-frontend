import Icon from './Icon';
import './PageHeader.css';

// Cabeçalho de página: título, subtítulo e ações opcionais (busca / filtros).
export default function PageHeader({ title, subtitle, search, onSearch, actions, children }) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {(search !== undefined || actions) && (
        <div className="page-header-tools">
          {search !== undefined && (
            <label className="search-field">
              <Icon name="search" size={18} />
              <input
                type="search"
                value={search}
                onChange={(e) => onSearch?.(e.target.value)}
                placeholder="Buscar por protocolo, bairro ou assunto"
                aria-label="Buscar"
              />
            </label>
          )}
          {actions}
        </div>
      )}
      {children}
    </header>
  );
}

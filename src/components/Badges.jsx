import { critMeta } from '../data/criticidade';
import { temDivergencia } from '../data/mockDenuncias';
import './Badges.css';

// Etiqueta de criticidade (Crítico / Alto / Médio / Baixo).
export function CritBadge({ nivel }) {
  const m = critMeta(nivel);
  return (
    <span className="badge crit-badge" style={{ color: m.color, background: m.bg }}>
      <span className="crit-dot" style={{ background: m.color }} />
      {nivel}
    </span>
  );
}

// Etiqueta de status. "Pendente de revisão" usa o roxo da IA.
export function StatusBadge({ status }) {
  const pendente = status === 'Pendente de revisão';
  const style = pendente
    ? { color: 'var(--ia)', background: 'var(--ia-bg)' }
    : { color: 'var(--ok)', background: 'var(--ok-bg)' };
  return (
    <span className="badge status-badge" style={style}>
      {status}
    </span>
  );
}

// Barra de confiança da classificação automática.
export function ConfBar({ valor, divergente }) {
  const cor = divergente ? 'var(--ia)' : 'var(--ok)';
  return (
    <div className="confbar">
      <div className="confbar-track">
        <div className="confbar-fill" style={{ width: `${valor}%`, background: cor }} />
      </div>
      <span className="confbar-num tnum" style={{ color: cor }}>
        {valor}%
      </span>
    </div>
  );
}

// Bloco que mostra a classificação da IA vs. o que o cidadão informou.
export function IAVeredito({ denuncia, compact = false }) {
  const divergente = temDivergencia(denuncia);
  return (
    <div className={`ia-veredito ${divergente ? 'is-divergente' : 'is-ok'} ${compact ? 'compact' : ''}`}>
      <div className="ia-row">
        <span className="ia-label">Cidadão informou</span>
        <span className="ia-value">{denuncia.assuntoCid}</span>
      </div>
      <div className="ia-arrow" aria-hidden="true">↓</div>
      <div className="ia-row">
        <span className="ia-label">IA classificou</span>
        <span className="ia-value ia-strong">{denuncia.assuntoIA}</span>
      </div>
      <ConfBar valor={denuncia.confianca} divergente={divergente} />
    </div>
  );
}

// Cartão branco padrão.
export function Card({ children, className = '', ...rest }) {
  return (
    <div className={`card-surface ${className}`} {...rest}>
      {children}
    </div>
  );
}

import { critMeta } from '../data/criticidade';
import './Badges.css';

const STATUS_STYLE = {
  'Recebida':            { color: 'var(--muted)',  background: 'var(--line-soft)' },
  'Classificada':        { color: 'var(--brand)',  background: 'var(--brand-tint)' },
  'Priorizada':          { color: 'var(--brand)',  background: 'var(--brand-tint)' },
  'Pendente de revisão': { color: 'var(--ia)',     background: 'var(--ia-bg)' },
  'Encaminhada':         { color: 'var(--ok)',     background: 'var(--ok-bg)' },
};

export function CritBadge({ nivel }) {
  if (!nivel) return null;
  const m = critMeta(nivel);
  return (
    <span className="badge crit-badge" style={{ color: m.color, background: m.bg }}>
      <span className="crit-dot" style={{ background: m.color }} />
      {nivel}
    </span>
  );
}

export function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] ?? { color: 'var(--muted)', background: 'var(--line-soft)' };
  return (
    <span className="badge status-badge" style={style}>
      {status}
    </span>
  );
}

export function ConfBar({ valor, divergente }) {
  if (valor == null) return null;
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

// Bloco de classificação automática. Funciona com dados do mock (assuntoIA presente)
// ou com dados brutos do M1 (assuntoIA = null → mostra "aguardando M2").
export function IAVeredito({ denuncia, compact = false }) {
  const temIA = Boolean(denuncia.assuntoIA);
  const divergente = temIA && denuncia.assuntoCid !== denuncia.assuntoIA;

  return (
    <div className={`ia-veredito ${divergente ? 'is-divergente' : 'is-ok'} ${compact ? 'compact' : ''}`}>
      <div className="ia-row">
        <span className="ia-label">Cidadão informou</span>
        <span className="ia-value">{denuncia.assuntoCid || '—'}</span>
      </div>

      {temIA ? (
        <>
          <div className="ia-arrow" aria-hidden="true">↓</div>
          <div className="ia-row">
            <span className="ia-label">IA classificou</span>
            <span className="ia-value ia-strong">{denuncia.assuntoIA}</span>
          </div>
          <ConfBar valor={denuncia.confianca} divergente={divergente} />
        </>
      ) : (
        <p className="ia-pending">Aguardando classificação automática (M2)</p>
      )}
    </div>
  );
}

export function Card({ children, className = '', ...rest }) {
  return (
    <div className={`card-surface ${className}`} {...rest}>
      {children}
    </div>
  );
}

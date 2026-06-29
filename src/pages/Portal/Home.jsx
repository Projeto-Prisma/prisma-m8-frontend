import { Link, useNavigate } from 'react-router-dom';
import PublicTopbar from '../../components/PublicTopbar';
import Icon from '../../components/Icon';
import './Home.css';

// Itens do "fluxo em tempo real" exibidos no card do hero.
const FLUXO = [
  {
    titulo: 'Buraco na pista · Av. Caxangá',
    sub: 'Encaminhada → Emlurb · há 4 min',
    cor: 'var(--crit-baixo)',
    tag: 'Alto',
    tagClass: 'is-alto',
  },
  {
    titulo: 'Lâmpada apagada · Ibura',
    sub: 'Pendente de revisão · há 6 min',
    cor: 'var(--ia)',
    tag: 'Revisão',
    tagClass: 'is-revisao',
  },
  {
    titulo: 'Alagamento recorrente · Afogados',
    sub: 'Crítico · 12ª ocorrência em 30 dias',
    cor: 'var(--crit-critico)',
    tag: 'Crítico',
    tagClass: 'is-critico',
  },
];

const COMO = [
  {
    n: 1,
    icon: 'edit',
    titulo: 'Você registra',
    desc: 'Descreva o problema, anexe uma foto e marque a localização. Leva menos de 2 minutos. Pode ser anônimo.',
  },
  {
    n: 2,
    icon: 'sparkles',
    titulo: 'O sistema classifica',
    desc: 'A denúncia é categorizada automaticamente por IA e cruzada com a recorrência da sua região.',
  },
  {
    n: 3,
    icon: 'send',
    titulo: 'Chega a quem resolve',
    desc: 'É encaminhada à secretaria responsável e você acompanha tudo pelo número de protocolo.',
  },
];

const STATS = [

];

export default function Home() {
  const navigate = useNavigate();

  const center = (
    <>
      <a href="#como" className="pub-nav-link">Como funciona</a>
      <Link to="/acompanhar" className="pub-nav-link">Consultar protocolo</Link>
    </>
  );

  const actions = (
    <Link to="/login" className="pub-btn-outline">
      <Icon name="lock" size={16} /> Área restrita
    </Link>
  );

  return (
    <div className="home">
      <PublicTopbar accessibility subtitle center={center} actions={actions} />

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <span className="home-hero-badge">
              <Icon name="building" size={14} /> Prefeitura do Recife · Ouvidoria
            </span>
            <h1>
              Sua denúncia,<br />no caminho certo.
            </h1>
            <p>
              Registre problemas urbanos e acompanhe o andamento. O sistema classifica
              automaticamente cada denúncia por inteligência artificial, identifica
              regiões com problemas recorrentes e encaminha à secretaria responsável.
            </p>
            <div className="home-hero-cta">
              <button type="button" className="btn-accent" onClick={() => navigate('/denunciar')}>
                <Icon name="plus" size={18} strokeWidth={2.1} /> Fazer uma denúncia
              </button>
              <button type="button" className="btn-hero-ghost" onClick={() => navigate('/acompanhar')}>
                <Icon name="search" size={18} /> Consultar protocolo
              </button>
            </div>
          </div>

          <aside className="home-hero-card">
            <span className="home-hero-card-title">Fluxo em tempo real</span>
            <div className="home-flow">
              {FLUXO.map((f, i) => (
                <div key={i} className="home-flow-item">
                  <span className="home-flow-dot" style={{ background: f.cor }} />
                  <div className="home-flow-body">
                    <strong>{f.titulo}</strong>
                    <span>{f.sub}</span>
                  </div>
                  <span className={`home-flow-tag ${f.tagClass}`}>{f.tag}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como" className="home-como">
        <div className="home-section-inner">
          <div className="home-section-head">
            <span className="home-eyebrow">Sistema Inteligente</span>
            <h2>Como funciona?</h2>
          </div>
          <div className="home-como-grid">
            {COMO.map((c) => (
              <article key={c.n} className="home-como-card">
                <div className="home-como-top">
                  <span className="home-como-num">{c.n}</span>
                  <span className="home-como-icon">
                    <Icon name={c.icon} size={20} />
                  </span>
                </div>
                <h3>{c.titulo}</h3>
                <p>{c.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="home-stats">
        <div className="home-stats-inner">
          {STATS.map((s, i) => (
            <div key={i} className="home-stat">
              <strong className="tnum">{s.valor}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="home-cta">
        <h2>Viu um problema na cidade? Registre agora.</h2>
        <p>Sua denúncia vai direto ao órgão responsável. Sem filas, sem burocracia.</p>
        <button type="button" className="btn-accent btn-accent-lg" onClick={() => navigate('/denunciar')}>
          <Icon name="plus" size={18} strokeWidth={2.1} /> Fazer uma denúncia
        </button>
      </section>

      {/* Rodapé */}
      <footer className="home-footer">
        <div className="home-footer-brand">
          <span className="home-footer-mark" aria-hidden="true">CR</span>
          <span>Conecta Recife · Prefeitura Municipal do Recife</span>
        </div>
        <span className="home-footer-note">Projeto acadêmico — Sistemas Distribuídos · UFRPE</span>
      </footer>
    </div>
  );
}

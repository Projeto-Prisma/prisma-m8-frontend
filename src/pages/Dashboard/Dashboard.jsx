import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import { CritBadge } from '../../components/Badges';
import { critMeta } from '../../data/criticidade';
import { fetchDenuncias, formatarHora, precisaRevisaoEfetiva } from '../../services/denunciasService';
import { fetchM2Stats } from '../../services/m2Service';
import {
  fetchRecorrencias,
  fetchTempoResposta,
  formatarTempoResposta,
  derivarCriticidade,
  fetchAnalyticsPorCategoria,
  fetchAnalyticsPorNivel,
  fetchVolumeDiario,
} from '../../services/m7Service';
import './Dashboard.css';

function isHoje(isoStr) {
  if (!isoStr) return false;
  const d = new Date(isoStr);
  const hoje = new Date();
  return (
    d.getFullYear() === hoje.getFullYear() &&
    d.getMonth() === hoje.getMonth() &&
    d.getDate() === hoje.getDate()
  );
}

function isMesAtual(isoStr) {
  if (!isoStr) return false;
  const d = new Date(isoStr);
  const hoje = new Date();
  return d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth();
}

const KPI_PLACEHOLDER = [
  { id: 'hoje',      label: 'Denúncias hoje',         valor: '—', nota: 'carregando…', tom: 'brand' },
  { id: 'pendentes', label: 'Pendentes de revisão',   valor: '—', nota: 'aguardando triagem humana', tom: 'ia' },
  { id: 'acumulado', label: 'Total no mês',            valor: '—', nota: '', tom: 'neutro' },
  { id: 'tempo',     label: 'Tempo médio de resposta', valor: '—', nota: 'do registro ao encaminhamento', tom: 'ok' },
];

export default function Dashboard() {
  const [kpis, setKpis]       = useState(KPI_PLACEHOLDER);
  const [feed, setFeed]       = useState([]);
  const [pendentes, setPendentes] = useState('—');
  const [recorrencias, setRecorrencias] = useState([]);
  const [porCategoria, setPorCategoria] = useState(null);
  const [porNivel, setPorNivel]         = useState(null);
  const [volumeDiario, setVolumeDiario] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchDenuncias().catch(() => []),
      fetchM2Stats().catch(() => null),
      fetchRecorrencias({ minContagem: 2, limite: 5 }).catch(() => []),
      fetchTempoResposta().catch(() => null),
      fetchAnalyticsPorCategoria().catch(() => []),
      fetchAnalyticsPorNivel().catch(() => []),
      fetchVolumeDiario(30).catch(() => []),
    ]).then(([lista, m2Stats, recData, tempoStats, catData, nivelData, volData]) => {
      setPorCategoria(catData?.length ? catData : []);
      setPorNivel(nivelData?.length ? nivelData : []);
      setVolumeDiario(volData?.length ? volData : []);
      const hoje     = lista.filter((d) => isHoje(d.recebidaEm));
      const mes      = lista.filter((d) => isMesAtual(d.recebidaEm));
      const encHoje  = hoje.filter((d) => d.status === 'ENCAMINHADA');

      const pendentesVal = m2Stats?.para_revisar ?? lista.filter(precisaRevisaoEfetiva).length;

      const tempoLabel = formatarTempoResposta(tempoStats);

      setPendentes(String(pendentesVal));

      setKpis([
        { id: 'hoje',      label: 'Denúncias hoje',         valor: String(hoje.length),     nota: `${encHoje.length} encaminhadas hoje`, tom: 'brand' },
        { id: 'pendentes', label: 'Pendentes de revisão',   valor: String(pendentesVal),    nota: 'aguardando triagem humana', tom: 'ia' },
        { id: 'acumulado', label: 'Total no mês',            valor: String(mes.length),      nota: '', tom: 'neutro' },
        { id: 'tempo',     label: 'Tempo médio de resposta', valor: tempoLabel,              nota: 'do registro ao encaminhamento', tom: 'ok' },
      ]);

      const feedItems = [...lista]
        .sort((a, b) => new Date(b.recebidaEm) - new Date(a.recebidaEm))
        .slice(0, 6)
        .map((d) => ({
          texto: d.descricao
            ? d.descricao.slice(0, 80) + (d.descricao.length > 80 ? '…' : '')
            : '—',
          bairro: d.onde || '—',
          hora: formatarHora(d.recebidaEm),
          criticidade: null,
          proto: d.protocolo,
        }));
      setFeed(feedItems);

      // Agrupa recorrências por região: pega a de maior contagem por bairro
      const porBairro = new Map();
      for (const r of recData) {
        const prev = porBairro.get(r.regiao);
        if (!prev || r.contagem > prev.contagem) {
          porBairro.set(r.regiao, r);
        }
      }
      const topRec = [...porBairro.values()]
        .sort((a, b) => b.contagem - a.contagem)
        .slice(0, 3)
        .map((r) => ({
          bairro: r.regiao,
          categoria: r.categoria,
          count: r.contagem,
          periodo: r.janela_tempo ?? '30 dias',
          criticidade: derivarCriticidade(r.contagem),
        }));
      setRecorrencias(topRec);
    });
  }, []);

  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle="Monitoramento e triagem inteligente das denúncias urbanas em Recife."
      />

      <div className="kpi-grid">
        {kpis.map((k) => (
          <div key={k.id} className={`kpi kpi-${k.tom}`}>
            <span className="kpi-label">{k.label}</span>
            <strong className="kpi-value tnum">{k.valor}</strong>
            <span className="kpi-note">{k.nota}</span>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Feed do dia */}
        <div className="card-surface dash-feed">
          <div className="card-head">
            <h2>Chegando hoje</h2>
            <Link to="/denuncias" className="link-more">
              Ver todas <Icon name="arrowRight" size={15} />
            </Link>
          </div>
          <ul className="feed-list">
            {feed.length === 0 && (
              <li className="feed-item" style={{ color: 'var(--muted)', padding: '12px 0' }}>
                Carregando denúncias…
              </li>
            )}
            {feed.map((d, i) => {
              const m = d.criticidade ? critMeta(d.criticidade) : { color: 'var(--line)' };
              return (
                <li key={i} className="feed-item">
                  <span className="feed-bar" style={{ background: m.color }} />
                  <div className="feed-body">
                    <p className="feed-text">{d.texto}</p>
                    <div className="feed-meta">
                      <span>
                        <Icon name="pin" size={13} /> {d.bairro}
                      </span>
                      <span className="tnum">
                        <Icon name="clock" size={13} /> {d.hora}
                      </span>
                    </div>
                  </div>
                  {d.criticidade && <CritBadge nivel={d.criticidade} />}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="dash-side">
          {/* Pendências de revisão (IA) */}
          <div className="card-surface review-card">
            <span className="review-icon" aria-hidden="true">
              <Icon name="cpu" size={20} />
            </span>
            <strong className="review-num tnum">{pendentes}</strong>
            <span className="review-label">denúncias pendentes de revisão</span>
            <p className="review-desc">
              Divergência de assunto ou baixa confiança da IA. Confirme o destino antes
              de encaminhar.
            </p>
            <Link to="/denuncias?filtro=pendentes" className="btn btn-ia">
              Revisar pendências <Icon name="arrowRight" size={16} />
            </Link>
          </div>

          {/* Recorrência — dados reais do M7 */}
          <div className="card-surface">
            <div className="card-head">
              <h2>
                <Icon name="repeat" size={16} /> Alertas de recorrência
              </h2>
            </div>
            <ul className="rec-list">
              {recorrencias.length === 0 ? (
                <li className="rec-item" style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Sem alertas de recorrência no período.
                </li>
              ) : (
                recorrencias.map((r, i) => (
                  <li key={i} className="rec-item">
                    <div className="rec-info">
                      <strong>{r.bairro}</strong>
                      <span>{r.categoria}</span>
                    </div>
                    <div className="rec-side">
                      <span className="rec-count tnum">{r.count}×</span>
                      <CritBadge nivel={r.criticidade} />
                    </div>
                  </li>
                ))
              )}
            </ul>
            <Link to="/mapa" className="link-more rec-foot">
              Ver mapa de criticidade <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ---- Gráficos M7 ---- */}
      <div className="charts-grid">
        <GraficoCategorias dados={porCategoria} />
        <GraficoNiveis dados={porNivel} />
        <GraficoVolumeDiario dados={volumeDiario} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Componentes de gráfico SVG — sem dependências externas              */
/* ------------------------------------------------------------------ */

const NIVEL_CORES = {
  CRITICO: 'var(--crit-critico)',
  ALTO:    'var(--crit-alto)',
  MEDIO:   'var(--crit-medio)',
  BAIXO:   'var(--crit-baixo)',
};
const NIVEL_LABEL = { CRITICO: 'Crítico', ALTO: 'Alto', MEDIO: 'Médio', BAIXO: 'Baixo' };

function ChartCard({ title, children, loading, vazio }) {
  return (
    <div className="card-surface chart-card">
      <div className="card-head">
        <h2>{title}</h2>
      </div>
      <div className="chart-body">
        {loading ? (
          <p className="chart-empty">Carregando…</p>
        ) : vazio ? (
          <p className="chart-empty">Sem dados ainda.</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function GraficoCategorias({ dados }) {
  const loading = dados === null;
  const vazio   = !loading && dados.length === 0;
  const top     = loading ? [] : [...dados].sort((a, b) => b.total - a.total).slice(0, 8);
  const max     = top[0]?.total || 1;

  return (
    <ChartCard title="Categorias mais denunciadas" loading={loading} vazio={vazio}>
      <ul className="bar-list">
        {top.map((item) => (
          <li key={item.chave} className="bar-row">
            <span className="bar-label" title={item.chave}>{item.chave}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${Math.round((item.total / max) * 100)}%`, background: 'var(--brand)' }}
              />
            </div>
            <span className="bar-val tnum">{item.total}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}

function GraficoNiveis({ dados }) {
  const loading = dados === null;
  const vazio   = !loading && dados.length === 0;
  const total   = loading ? 0 : dados.reduce((s, d) => s + (d.total || 0), 0) || 1;

  return (
    <ChartCard title="Distribuição por criticidade" loading={loading} vazio={vazio}>
      <div className="nivel-bars">
        {['CRITICO', 'ALTO', 'MEDIO', 'BAIXO'].map((nivel) => {
          const item = dados?.find((d) => d.chave === nivel);
          const val  = item?.total ?? 0;
          const pct  = Math.round((val / total) * 100);
          return (
            <div key={nivel} className="nivel-row">
              <span className="nivel-dot" style={{ background: NIVEL_CORES[nivel] }} />
              <span className="nivel-label">{NIVEL_LABEL[nivel]}</span>
              <div className="nivel-track">
                <div
                  className="nivel-fill"
                  style={{ width: `${pct}%`, background: NIVEL_CORES[nivel] }}
                />
              </div>
              <span className="nivel-pct tnum">{pct}%</span>
              <span className="nivel-cnt tnum">({val})</span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

function GraficoVolumeDiario({ dados }) {
  const loading = dados === null;
  const vazio   = !loading && dados.length === 0;

  const pontos  = loading ? [] : [...dados].sort((a, b) => a.data.localeCompare(b.data)).slice(-30);
  const maxVal  = pontos.reduce((m, p) => Math.max(m, p.total), 1);

  const W = 560, H = 100, PAD = 4;
  const step = pontos.length > 1 ? (W - PAD * 2) / (pontos.length - 1) : W - PAD * 2;

  const pts = pontos.map((p, i) => ({
    x: PAD + i * step,
    y: H - PAD - Math.round(((p.total / maxVal) * (H - PAD * 2))),
    total: p.total,
    data: p.data,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <ChartCard title="Volume diário — últimos 30 dias" loading={loading} vazio={vazio}>
      <div className="vol-wrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="vol-svg"
          aria-label="Gráfico de volume diário"
          role="img"
        >
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--line)" strokeWidth="1" />
          {pts.length > 1 && (
            <polyline
              points={polyline}
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {pts.map((p) => (
            <circle key={p.data} cx={p.x} cy={p.y} r="3" fill="var(--brand)">
              <title>{p.data}: {p.total}</title>
            </circle>
          ))}
        </svg>
        <div className="vol-foot">
          {pontos.length > 0 && (
            <>
              <span className="tnum" style={{ color: 'var(--muted)', fontSize: 12 }}>
                {pontos[0]?.data}
              </span>
              <span className="tnum" style={{ color: 'var(--muted)', fontSize: 12 }}>
                {pontos[pontos.length - 1]?.data}
              </span>
            </>
          )}
        </div>
      </div>
    </ChartCard>
  );
}

import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import { CritBadge } from '../../components/Badges';
import { kpis, recorrencias } from '../../data/mockDashboard';
import { feedDenunciasHoje } from '../../data/mockDenuncias';
import { critMeta } from '../../data/criticidade';
import './Dashboard.css';

export default function Dashboard() {
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
            {feedDenunciasHoje.map((d, i) => {
              const m = critMeta(d.criticidade);
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
                  <CritBadge nivel={d.criticidade} />
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
            <strong className="review-num tnum">17</strong>
            <span className="review-label">denúncias pendentes de revisão</span>
            <p className="review-desc">
              A IA classificou um assunto diferente do que o cidadão informou. Confirme
              o destino antes de encaminhar.
            </p>
            <Link to="/denuncias?filtro=pendentes" className="btn btn-ia">
              Revisar pendências <Icon name="arrowRight" size={16} />
            </Link>
          </div>

          {/* Recorrência */}
          <div className="card-surface">
            <div className="card-head">
              <h2>
                <Icon name="repeat" size={16} /> Alertas de recorrência
              </h2>
            </div>
            <ul className="rec-list">
              {recorrencias.map((r, i) => (
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
              ))}
            </ul>
            <Link to="/mapa" className="link-more rec-foot">
              Ver mapa de criticidade <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

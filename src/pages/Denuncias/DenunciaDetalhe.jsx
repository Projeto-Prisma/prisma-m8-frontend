import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { CritBadge, StatusBadge, IAVeredito, Card } from '../../components/Badges';
import { getDenuncia, temDivergencia } from '../../data/mockDenuncias';
import './DenunciaDetalhe.css';

export default function DenunciaDetalhe() {
  const { proto } = useParams();
  const d = getDenuncia(proto);

  if (!d) {
    return (
      <section className="det-missing">
        <Icon name="alert" size={32} />
        <h1>Protocolo não encontrado</h1>
        <p>Não há denúncia registrada com o protocolo #{proto}.</p>
        <Link to="/denuncias" className="btn btn-brand">
          <Icon name="arrowLeft" size={16} /> Voltar para denúncias
        </Link>
      </section>
    );
  }

  const divergente = temDivergencia(d);
  const pendente = d.status === 'Pendente de revisão';

  const etapas = [
    { titulo: 'Denúncia registrada', desc: `Recebida pelo cidadão em ${d.data}.`, done: true },
    {
      titulo: 'Classificada pela IA',
      desc: `Assunto sugerido: ${d.assuntoIA} · confiança ${d.confianca}%.`,
      done: true,
    },
    divergente
      ? {
          titulo: 'Pendente de revisão',
          desc: 'Assunto da IA difere do informado pelo cidadão. Aguardando confirmação humana.',
          done: false,
          atual: true,
        }
      : {
          titulo: 'Encaminhada ao órgão',
          desc: `Roteada para ${d.orgao}. Órgão notificado por e-mail.`,
          done: true,
          atual: true,
        },
  ];

  return (
    <section className="det">
      <Link to="/denuncias" className="back-link">
        <Icon name="arrowLeft" size={16} /> Denúncias
      </Link>

      <header className="det-header">
        <div>
          <span className="det-proto tnum">#{d.proto}</span>
          <h1>Denúncia em {d.bairro}</h1>
          <span className="det-data tnum">
            <Icon name="clock" size={14} /> {d.data}
          </span>
        </div>
        <div className="det-badges">
          <CritBadge nivel={d.criticidade} />
          <StatusBadge status={d.status} />
        </div>
      </header>

      <div className="det-grid">
        <div className="det-col">
          <Card className="det-text-card">
            <h2>Manifestação do cidadão</h2>
            <p className="det-text">{d.texto}</p>
            <div className="det-loc">
              <Icon name="pin" size={16} />
              <span>{d.bairro}, Recife — PE</span>
              <Link to="/mapa" className="link-more det-loc-link">
                Ver no mapa <Icon name="arrowRight" size={14} />
              </Link>
            </div>
          </Card>

          <Card className="det-timeline-card">
            <h2>Triagem</h2>
            <ol className="timeline">
              {etapas.map((e, i) => (
                <li key={i} className={`tl-item ${e.done ? 'done' : ''} ${e.atual ? 'atual' : ''}`}>
                  <span className="tl-dot">
                    {e.done ? <Icon name="check" size={12} strokeWidth={2.4} /> : <Icon name="dot" size={12} />}
                  </span>
                  <div className="tl-body">
                    <strong>{e.titulo}</strong>
                    <span>{e.desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="det-col">
          <Card className="det-ia-card">
            <h2>
              <Icon name="cpu" size={16} /> Classificação automática
            </h2>
            <IAVeredito denuncia={d} />
            {divergente && (
              <p className="det-ia-hint">
                A IA discorda do assunto informado. Revise antes de encaminhar — isso
                alimenta o aprendizado do modelo.
              </p>
            )}
          </Card>

          <Card className="det-route-card">
            <h2>Encaminhamento</h2>
            <div className="route-orgao">
              <span className="route-orgao-icon" aria-hidden="true">
                <Icon name="building" size={18} />
              </span>
              <div>
                <strong>{d.orgao}</strong>
                <span>órgão responsável sugerido</span>
              </div>
            </div>

            {pendente ? (
              <div className="route-actions">
                <button className="btn btn-ia" type="button">
                  <Icon name="check" size={16} /> Confirmar e encaminhar
                </button>
                <button className="btn btn-ghost" type="button">
                  Corrigir assunto
                </button>
              </div>
            ) : (
              <div className="route-done">
                <Icon name="check" size={16} /> Encaminhada e notificada por e-mail.
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}

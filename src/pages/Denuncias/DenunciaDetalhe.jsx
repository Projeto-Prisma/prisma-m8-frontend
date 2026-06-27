import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { CritBadge, StatusBadge, IAVeredito, Card } from '../../components/Badges';
import {
  fetchDenunciaPorProtocolo,
  normalizarDenuncia,
  atualizarStatusDenuncia,
  formatarData,
} from '../../services/denunciasService';
import './DenunciaDetalhe.css';

export default function DenunciaDetalhe() {
  const { proto } = useParams();
  const [d, setD]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]     = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    fetchDenunciaPorProtocolo(proto)
      .then((raw) => {
        if (!raw) { setErro('not-found'); return; }
        setD({ ...normalizarDenuncia(raw), id: raw.id, historico: raw.historico ?? [] });
      })
      .catch(() => setErro('erro'))
      .finally(() => setLoading(false));
  }, [proto]);

  const confirmarEncaminhamento = async () => {
    if (!d?.id) return;
    setAtualizando(true);
    try {
      await atualizarStatusDenuncia(d.id, 'ENCAMINHADA');
      setD((prev) => ({ ...prev, status: 'Encaminhada', statusRaw: 'ENCAMINHADA' }));
    } catch (e) {
      alert(`Erro ao atualizar: ${e.message}`);
    } finally {
      setAtualizando(false);
    }
  };

  if (loading) {
    return (
      <section style={{ padding: '48px 24px', color: 'var(--muted)' }}>
        Carregando denúncia…
      </section>
    );
  }

  if (erro === 'not-found' || !d) {
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

  if (erro) {
    return (
      <section className="det-missing">
        <Icon name="alert" size={32} />
        <h1>Erro ao carregar</h1>
        <p>Não foi possível buscar a denúncia. Verifique se o M1 está rodando.</p>
        <Link to="/denuncias" className="btn btn-brand">
          <Icon name="arrowLeft" size={16} /> Voltar para denúncias
        </Link>
      </section>
    );
  }

  const divergente = Boolean(d.assuntoIA) && d.assuntoCid !== d.assuntoIA;
  const pendente   = d.statusRaw === 'PENDENTE_DE_REVISAO';
  const encaminhada = d.statusRaw === 'ENCAMINHADA';

  const etapas = construirEtapas(d, divergente, encaminhada, pendente);

  return (
    <section className="det">
      <Link to="/denuncias" className="back-link">
        <Icon name="arrowLeft" size={16} /> Denúncias
      </Link>

      <header className="det-header">
        <div>
          <span className="det-proto tnum">#{d.proto}</span>
          <h1>{d.assuntoCid}</h1>
          <span className="det-data tnum">
            <Icon name="clock" size={14} /> {formatarData(d.recebidaEm)}
            {d.onde && d.onde !== '—' && ` · ${d.onde}`}
          </span>
        </div>
        <div className="det-badges">
          {d.criticidade && <CritBadge nivel={d.criticidade} />}
          <StatusBadge status={d.status} />
        </div>
      </header>

      <div className="det-grid">
        <div className="det-col">
          <Card className="det-text-card">
            <h2>Manifestação do cidadão</h2>
            <p className="det-text">{d.texto}</p>
            {d.onde && d.onde !== '—' && (
              <div className="det-loc">
                <Icon name="pin" size={16} />
                <span>{d.onde}</span>
              </div>
            )}
          </Card>

          <Card className="det-timeline-card">
            <h2>Triagem</h2>
            <ol className="timeline">
              {etapas.map((e, i) => (
                <li key={i} className={`tl-item ${e.done ? 'done' : ''} ${e.atual ? 'atual' : ''}`}>
                  <span className="tl-dot">
                    {e.done
                      ? <Icon name="check" size={12} strokeWidth={2.4} />
                      : <Icon name="dot" size={12} />}
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
            <h2><Icon name="cpu" size={16} /> Classificação automática</h2>
            <IAVeredito denuncia={d} />
            {divergente && (
              <p className="det-ia-hint">
                A IA discorda do assunto informado. Revise antes de encaminhar.
              </p>
            )}
          </Card>

          <Card className="det-route-card">
            <h2>Encaminhamento</h2>
            {d.orgao ? (
              <div className="route-orgao">
                <span className="route-orgao-icon" aria-hidden="true">
                  <Icon name="building" size={18} />
                </span>
                <div>
                  <strong>{d.orgao}</strong>
                  <span>órgão responsável</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '14px 0 18px' }}>
                Órgão destino ainda não definido — aguardando M5 (roteamento).
              </p>
            )}

            {pendente && (
              <div className="route-actions">
                <button
                  className="btn btn-ia"
                  type="button"
                  onClick={confirmarEncaminhamento}
                  disabled={atualizando}
                >
                  <Icon name="check" size={16} />
                  {atualizando ? 'Atualizando…' : 'Confirmar e encaminhar'}
                </button>
              </div>
            )}
            {encaminhada && (
              <div className="route-done">
                <Icon name="check" size={16} /> Encaminhada ao órgão responsável.
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}

function construirEtapas(d, divergente, encaminhada, pendente) {
  const data = formatarData(d.recebidaEm);

  const etapas = [
    {
      titulo: 'Denúncia registrada',
      desc: `Recebida em ${data}.`,
      done: true,
    },
  ];

  if (d.assuntoIA) {
    etapas.push({
      titulo: 'Classificada pela IA',
      desc: `Assunto sugerido: ${d.assuntoIA}${d.confianca ? ` · confiança ${d.confianca}%` : ''}${divergente ? ' — divergência com o informado' : ''}`,
      done: true,
    });
  } else {
    etapas.push({
      titulo: 'Aguardando classificação (M2)',
      desc: 'Análise automática do texto ainda em andamento.',
      done: false,
      atual: true,
    });
  }

  if (d.criticidade) {
    etapas.push({
      titulo: `Prioridade: ${d.criticidade}`,
      desc: 'Score de criticidade calculado pelo M3.',
      done: true,
    });
  }

  if (pendente) {
    etapas.push({
      titulo: 'Pendente de revisão',
      desc: 'Assunto da IA difere do informado. Aguardando confirmação humana.',
      done: false,
      atual: true,
    });
  } else if (encaminhada) {
    etapas.push({
      titulo: 'Encaminhada ao órgão',
      desc: d.orgao ? `Roteada para ${d.orgao}.` : 'Órgão notificado.',
      done: true,
      atual: true,
    });
  }

  return etapas;
}

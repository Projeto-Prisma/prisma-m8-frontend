import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PublicTopbar from '../../components/PublicTopbar';
import Icon from '../../components/Icon';
import { fetchDenunciaPorProtocolo, normalizarDenuncia, formatarData, encaminhadaEfetiva, statusEfetivo } from '../../services/denunciasService';
import { fetchM2Denuncia } from '../../services/m2Service';
import { fetchM3Denuncia } from '../../services/m3Service';
import { fetchEncaminhamentoPorDenuncia } from '../../services/m5Service';
import './Acompanhar.css';

function construirEtapasPublicas(d) {
  const data = formatarData(d.recebidaEm);
  const precisaRevisao = Boolean(d.revisar || (d.assuntoIA && d.assuntoCid !== d.assuntoIA));
  const encaminhada = encaminhadaEfetiva(d);

  const etapas = [
    {
      title: 'Recebida',
      detail: 'Denúncia registrada no sistema',
      time: data,
      done: true,
    },
    {
      title: d.assuntoIA ? `Classificada: ${d.assuntoIA}` : 'Classificando pela IA…',
      detail: d.assuntoIA
        ? 'Categoria identificada pela análise automática'
        : 'Análise automática do texto em andamento',
      time: d.assuntoIA ? data : '',
      done: Boolean(d.assuntoIA),
      current: !d.assuntoIA,
    },
  ];

  if (precisaRevisao && !encaminhada) {
    etapas.push({
      title: 'Em análise — aguardando confirmação humana',
      detail: d.revisar
        ? 'Nível de confiança da IA requer verificação antes do encaminhamento'
        : 'A IA discordou do assunto informado — um atendente está revisando',
      time: '',
      done: false,
      current: true,
    });
    return etapas;
  }

  etapas.push({
    title: d.criticidade ? 'Prioridade calculada' : 'Priorização',
    detail: d.criticidade ? `Nível de criticidade: ${d.criticidade}` : '—',
    time: d.criticidade ? data : '',
    done: Boolean(d.criticidade),
    current: Boolean(d.assuntoIA) && !d.criticidade,
  });

  etapas.push({
    title: encaminhada
      ? (d.orgao ? `Encaminhada: ${d.orgao}` : 'Encaminhada ao órgão')
      : 'Encaminhamento ao órgão',
    detail: encaminhada ? 'Órgão responsável notificado pelo sistema' : '—',
    time: encaminhada ? data : '',
    done: encaminhada,
    current: Boolean(d.criticidade) && !encaminhada,
  });

  return etapas;
}

export default function Acompanhar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [input, setInput] = useState(params.get('proto') || '');
  const [resultado, setResultado] = useState(null); // null | { tipo, denuncia? }
  const [carregando, setCarregando] = useState(false);

  const consultar = async () => {
    const proto = input.trim();
    if (!proto) return;
    setCarregando(true);
    setResultado(null);
    try {
      const raw = await fetchDenunciaPorProtocolo(proto);
      if (raw) {
        const [m2, m3, m5] = await Promise.all([
          raw.id ? fetchM2Denuncia(raw.id).catch(() => null) : null,
          raw.id ? fetchM3Denuncia(raw.id).catch(() => null) : null,
          raw.id ? fetchEncaminhamentoPorDenuncia(raw.id).catch(() => null) : null,
        ]);
        setResultado({ tipo: 'ok', denuncia: normalizarDenuncia(raw, m2, m3, m5) });
      } else {
        setResultado({ tipo: 'nao-encontrado', proto });
      }
    } catch {
      setResultado({ tipo: 'nao-encontrado', proto });
    } finally {
      setCarregando(false);
    }
  };

  const actions = (
    <>
      <button type="button" className="pub-link-back" onClick={() => navigate('/portal')}>
        ← Início
      </button>
      <button type="button" className="pub-btn-accent-sm" onClick={() => navigate('/denunciar')}>
        Nova denúncia
      </button>
    </>
  );

  return (
    <div className="acomp-page">
      <PublicTopbar actions={actions} />

      <div className="acomp-banner">
        <h1>Acompanhe sua Denúncia</h1>
      </div>

      <div className="acomp-body">
        <div className="acomp-search">
          <div className="acomp-search-field tnum">
            <Icon name="search" size={18} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && consultar()}
              placeholder="PRISMA-XXXXXXXX"
              aria-label="Número do protocolo"
            />
          </div>
          <button type="button" className="acomp-search-btn" onClick={consultar} disabled={carregando}>
            {carregando ? 'Consultando…' : 'Consultar'}
          </button>
        </div>

        {resultado?.tipo === 'ok'           && <ResultadoOk denuncia={resultado.denuncia} />}
        {resultado?.tipo === 'nao-encontrado' && <NaoEncontrado proto={resultado.proto} />}

        <div className="acomp-foot">
          <Link to="/portal" className="acomp-back">← Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}

function ResultadoOk({ denuncia: d }) {
  const etapas = construirEtapasPublicas(d);
  const statusLabel = statusEfetivo(d);
  const statusClass = statusLabel === 'Encaminhada' ? 'is-ok' : statusLabel === 'Pendente de revisão' ? 'is-pend' : 'is-triagem';

  return (
    <div className="acomp-card">
      <div className="acomp-card-head">
        <div>
          <div className="acomp-proto tnum">Protocolo: {d.proto}</div>
          <h2>{d.assuntoCid}</h2>
          <div className="acomp-chips">
            <span className="acomp-chip acomp-chip-muted">
              <Icon name="clock" size={13} /> {formatarData(d.recebidaEm)}
            </span>
            {d.onde && d.onde !== '—' && (
              <span className="acomp-chip acomp-chip-muted">
                <Icon name="pin" size={13} /> {d.onde}
              </span>
            )}
          </div>
        </div>
        <span className={`acomp-status ${statusClass}`}>
          {statusLabel}
        </span>
      </div>
      <Timeline etapas={etapas} />
    </div>
  );
}

function NaoEncontrado({ proto }) {
  return (
    <div className="acomp-card acomp-empty">
      <span className="acomp-empty-icon">
        <Icon name="search" size={26} />
      </span>
      <h2>Protocolo não encontrado</h2>
      <p>
        {proto
          ? `Não localizamos nenhuma denúncia com o protocolo "${proto}". Confira o número (formato PRISMA-XXXXXXXX) e tente novamente.`
          : 'Informe o número de protocolo recebido ao registrar a denúncia.'}
      </p>
    </div>
  );
}

function Timeline({ etapas }) {
  return (
    <div className="acomp-timeline">
      <div className="acomp-timeline-title">Linha do tempo</div>
      {etapas.map((t, i) => {
        const last = i === etapas.length - 1;
        const estado = t.done ? 'done' : t.current ? 'current' : 'pending';
        return (
          <div key={i} className="acomp-tl-item">
            <div className="acomp-tl-rail">
              <span className={`acomp-tl-dot is-${estado}`}>
                {t.done && <Icon name="check" size={14} strokeWidth={2.4} />}
              </span>
              {!last && <span className={`acomp-tl-line ${t.done ? 'is-done' : ''}`} />}
            </div>
            <div className="acomp-tl-body">
              <div className={`acomp-tl-heading is-${estado}`}>{t.title}</div>
              <div className="acomp-tl-detail">{t.detail}</div>
              {t.time && <div className="acomp-tl-time tnum">{t.time}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

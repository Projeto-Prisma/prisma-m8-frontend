import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PublicTopbar from '../../components/PublicTopbar';
import Icon from '../../components/Icon';
import { getDenuncia } from '../../data/mockDenuncias';
import { critMeta } from '../../data/criticidade';
import { timelineFromDenuncia } from '../../data/mockProtocolo';
import './Acompanhar.css';

const PROTO_DEMO = '2025-074839';
const RE_PROTO = /^2025-\d{6}$/;

// Linha do tempo para um protocolo recém-registrado (ainda não está no mock).
function timelineEmTriagem() {
  return [
    { title: 'Recebida', detail: 'Denúncia registrada no sistema', time: 'agora há pouco', done: true },
    { title: 'Classificando pela IA…', detail: 'Análise automática do texto em andamento', time: '', done: false, current: true },
    { title: 'Priorização', detail: '—', time: '', done: false },
    { title: 'Encaminhamento ao órgão', detail: '—', time: '', done: false },
  ];
}

function resolver(proto) {
  const limpo = (proto || '').trim();
  const d = getDenuncia(limpo);
  if (d) return { tipo: 'ok', denuncia: d };
  if (RE_PROTO.test(limpo)) return { tipo: 'triagem', proto: limpo };
  return { tipo: 'nao-encontrado', proto: limpo };
}

export default function Acompanhar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inicial = params.get('proto') || PROTO_DEMO;

  const [input, setInput] = useState(inicial);
  const [consulta, setConsulta] = useState(() => resolver(inicial));

  const consultar = () => setConsulta(resolver(input));

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
        {/* Busca */}
        <div className="acomp-search">
          <div className="acomp-search-field tnum">
            <Icon name="search" size={18} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && consultar()}
              placeholder="2025-000000"
              aria-label="Número do protocolo"
            />
          </div>
          <button type="button" className="acomp-search-btn" onClick={consultar}>
            Consultar
          </button>
        </div>

        {consulta.tipo === 'ok' && <ResultadoOk denuncia={consulta.denuncia} />}
        {consulta.tipo === 'triagem' && <ResultadoTriagem proto={consulta.proto} />}
        {consulta.tipo === 'nao-encontrado' && <NaoEncontrado proto={consulta.proto} />}

        <div className="acomp-foot">
          <Link to="/portal" className="acomp-back">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- Resultado encontrado ---------- */
function ResultadoOk({ denuncia: d }) {
  const m = critMeta(d.criticidade);
  const etapas = useMemo(() => timelineFromDenuncia(d), [d]);
  const encaminhada = d.status === 'Encaminhada';

  return (
    <div className="acomp-card">
      <div className="acomp-card-head">
        <div>
          <div className="acomp-proto tnum">Protocolo: {d.proto}</div>
          <h2>{d.assuntoIA}</h2>
          <div className="acomp-chips">
            <span className="acomp-chip" style={{ background: m.bg, color: m.color }}>
              {d.criticidade}
            </span>
            <span className="acomp-chip acomp-chip-muted">
              <Icon name="pin" size={13} /> {d.bairro} · Recife
            </span>
            <span className="acomp-chip acomp-chip-muted">{d.orgao}</span>
          </div>
        </div>
        <span className={`acomp-status ${encaminhada ? 'is-ok' : 'is-pend'}`}>{d.status}</span>
      </div>

      <Timeline etapas={etapas} />
    </div>
  );
}

/* ---------- Protocolo em triagem (recém-registrado) ---------- */
function ResultadoTriagem({ proto }) {
  const etapas = timelineEmTriagem();
  return (
    <div className="acomp-card">
      <div className="acomp-card-head">
        <div>
          <div className="acomp-proto tnum">Protocolo: {proto}</div>
          <h2>Denúncia em triagem</h2>
          <div className="acomp-chips">
            <span className="acomp-chip acomp-chip-muted">
              <Icon name="clock" size={13} /> Registrada agora há pouco
            </span>
          </div>
        </div>
        <span className="acomp-status is-triagem">Em triagem</span>
      </div>
      <Timeline etapas={etapas} />
    </div>
  );
}

/* ---------- Não encontrado ---------- */
function NaoEncontrado({ proto }) {
  return (
    <div className="acomp-card acomp-empty">
      <span className="acomp-empty-icon">
        <Icon name="search" size={26} />
      </span>
      <h2>Protocolo não encontrado</h2>
      <p>
        {proto
          ? `Não localizamos nenhuma denúncia com o protocolo “${proto}”. Confira o número (formato 2025-000000) e tente novamente.`
          : 'Informe o número de protocolo recebido ao registrar a denúncia.'}
      </p>
    </div>
  );
}

/* ---------- Linha do tempo ---------- */
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

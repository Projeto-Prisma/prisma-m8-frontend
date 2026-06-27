import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import { CritBadge, StatusBadge } from '../../components/Badges';
import { fetchDenuncias, normalizarDenuncia } from '../../services/denunciasService';
import './Denuncias.css';

const FILTROS = [
  { id: 'todas',        label: 'Todas' },
  { id: 'pendentes',    label: 'Pendentes de revisão' },
  { id: 'encaminhadas', label: 'Encaminhadas' },
];

export default function Denuncias() {
  const [params, setParams] = useSearchParams();
  const filtro = params.get('filtro') || 'todas';
  const [busca, setBusca] = useState('');

  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState(null);

  useEffect(() => {
    fetchDenuncias()
      .then((lista) => setDenuncias(lista.map(normalizarDenuncia)))
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  const contagens = useMemo(() => ({
    todas:        denuncias.length,
    pendentes:    denuncias.filter((d) => d.statusRaw === 'PENDENTE_DE_REVISAO').length,
    encaminhadas: denuncias.filter((d) => d.statusRaw === 'ENCAMINHADA').length,
  }), [denuncias]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return denuncias
      .filter((d) => {
        if (filtro === 'pendentes')    return d.statusRaw === 'PENDENTE_DE_REVISAO';
        if (filtro === 'encaminhadas') return d.statusRaw === 'ENCAMINHADA';
        return true;
      })
      .filter((d) => {
        if (!q) return true;
        return (
          d.proto.toLowerCase().includes(q) ||
          d.onde.toLowerCase().includes(q) ||
          d.assuntoCid.toLowerCase().includes(q) ||
          d.texto.toLowerCase().includes(q)
        );
      });
  }, [filtro, busca, denuncias]);

  const setFiltro = (id) => {
    if (id === 'todas') setParams({});
    else setParams({ filtro: id });
  };

  return (
    <section>
      <PageHeader
        title="Denúncias"
        subtitle={
          loading ? 'Carregando...'
          : erro    ? `Erro: ${erro}`
          : 'Manifestações registradas pelos cidadãos.'
        }
        search={busca}
        onSearch={setBusca}
        searchPlaceholder="Buscar por protocolo, local ou assunto"
      />

      <div className="filters" role="tablist" aria-label="Filtrar denúncias">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filtro === f.id}
            className={`filter-tab ${filtro === f.id ? 'is-active' : ''}`}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
            <span className="filter-count tnum">{contagens[f.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="den-list">
        {loading && <p style={{ padding: '24px', color: 'var(--muted)' }}>Carregando denúncias…</p>}

        {!loading && lista.map((d) => {
          const temIA       = Boolean(d.assuntoIA);
          const divergente  = temIA && d.assuntoCid !== d.assuntoIA;

          return (
            <Link key={d.proto} to={`/denuncias/${d.proto}`} className="den-row">
              {/* barra lateral — cinza quando criticidade ainda não chegou do M3 */}
              <span
                className="den-bar"
                style={{ background: d.criticidade ? undefined : 'var(--line)' }}
              />

              <div className="den-main">
                <div className="den-top">
                  <span className="den-proto tnum">#{d.proto}</span>
                  <span className="den-data tnum">{d.data}</span>
                </div>
                <p className="den-text">{d.texto}</p>
                <div className="den-tags">
                  <span className="den-tag">
                    <Icon name="pin" size={13} /> {d.onde}
                  </span>
                  {d.orgao && (
                    <span className="den-tag">
                      <Icon name="building" size={13} /> {d.orgao}
                    </span>
                  )}
                </div>
              </div>

              <div className="den-ia">
                {temIA ? (
                  <>
                    <div className={`ia-pill ${divergente ? 'is-div' : 'is-ok'}`}>
                      <Icon name="cpu" size={13} />
                      <span>{d.assuntoIA}</span>
                    </div>
                    {divergente
                      ? <span className="ia-note ia-note-div">≠ {d.assuntoCid}</span>
                      : <span className="ia-note ia-note-ok">confirma o cidadão</span>}
                    <span className="ia-conf tnum">{d.confianca}% confiança</span>
                  </>
                ) : (
                  <div className="ia-pill ia-pill-pending">
                    <Icon name="cpu" size={13} />
                    <span>Aguardando M2</span>
                  </div>
                )}
              </div>

              <div className="den-end">
                {d.criticidade && <CritBadge nivel={d.criticidade} />}
                <StatusBadge status={d.status} />
                <Icon name="arrowRight" size={18} className="den-chevron" />
              </div>
            </Link>
          );
        })}

        {!loading && lista.length === 0 && (
          <div className="den-empty">
            <Icon name="search" size={28} />
            <p>Nenhuma denúncia encontrada para esse filtro.</p>
            <button className="link-more" onClick={() => { setBusca(''); setFiltro('todas'); }}>
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

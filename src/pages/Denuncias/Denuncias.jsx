import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import { CritBadge, StatusBadge } from '../../components/Badges';
import { mockDenuncias, temDivergencia } from '../../data/mockDenuncias';
import { critMeta, PESO_CRITICIDADE } from '../../data/criticidade';
import './Denuncias.css';

const FILTROS = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendentes', label: 'Pendentes de revisão' },
  { id: 'encaminhadas', label: 'Encaminhadas' },
];

export default function Denuncias() {
  const [params, setParams] = useSearchParams();
  const filtro = params.get('filtro') || 'todas';
  const [busca, setBusca] = useState('');

  const contagens = useMemo(
    () => ({
      todas: mockDenuncias.length,
      pendentes: mockDenuncias.filter((d) => d.status === 'Pendente de revisão').length,
      encaminhadas: mockDenuncias.filter((d) => d.status === 'Encaminhada').length,
    }),
    []
  );

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return mockDenuncias
      .filter((d) => {
        if (filtro === 'pendentes') return d.status === 'Pendente de revisão';
        if (filtro === 'encaminhadas') return d.status === 'Encaminhada';
        return true;
      })
      .filter((d) => {
        if (!q) return true;
        return (
          d.proto.toLowerCase().includes(q) ||
          d.bairro.toLowerCase().includes(q) ||
          d.assuntoCid.toLowerCase().includes(q) ||
          d.assuntoIA.toLowerCase().includes(q) ||
          d.texto.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => PESO_CRITICIDADE[b.criticidade] - PESO_CRITICIDADE[a.criticidade]);
  }, [filtro, busca]);

  const setFiltro = (id) => {
    if (id === 'todas') setParams({});
    else setParams({ filtro: id });
  };

  return (
    <section>
      <PageHeader
        title="Denúncias"
        subtitle="Manifestações registradas pelos cidadãos, com a classificação automática da IA."
        search={busca}
        onSearch={setBusca}
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
            <span className="filter-count tnum">{contagens[f.id]}</span>
          </button>
        ))}
      </div>

      <div className="den-list">
        {lista.map((d) => {
          const m = critMeta(d.criticidade);
          const divergente = temDivergencia(d);
          return (
            <Link key={d.proto} to={`/denuncias/${d.proto}`} className="den-row">
              <span className="den-bar" style={{ background: m.color }} />

              <div className="den-main">
                <div className="den-top">
                  <span className="den-proto tnum">#{d.proto}</span>
                  <span className="den-data tnum">{d.data}</span>
                </div>
                <p className="den-text">{d.texto}</p>
                <div className="den-tags">
                  <span className="den-tag">
                    <Icon name="pin" size={13} /> {d.bairro}
                  </span>
                  <span className="den-tag">
                    <Icon name="building" size={13} /> {d.orgao}
                  </span>
                </div>
              </div>

              <div className="den-ia">
                <div className={`ia-pill ${divergente ? 'is-div' : 'is-ok'}`}>
                  <Icon name="cpu" size={13} />
                  <span>{d.assuntoIA}</span>
                </div>
                {divergente ? (
                  <span className="ia-note ia-note-div">≠ {d.assuntoCid}</span>
                ) : (
                  <span className="ia-note ia-note-ok">confirma o cidadão</span>
                )}
                <span className="ia-conf tnum" style={{ color: divergente ? 'var(--ia)' : 'var(--ok)' }}>
                  {d.confianca}% confiança
                </span>
              </div>

              <div className="den-end">
                <CritBadge nivel={d.criticidade} />
                <StatusBadge status={d.status} />
                <Icon name="arrowRight" size={18} className="den-chevron" />
              </div>
            </Link>
          );
        })}

        {lista.length === 0 && (
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

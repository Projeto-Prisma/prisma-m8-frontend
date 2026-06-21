import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import { rankingOrgaos, orgaos as orgaosBase } from '../../data/mockOrgaos';
import './Orgaos.css';

export default function Orgaos() {
  const [orgaos, setOrgaos] = useState(orgaosBase);
  const ativos = orgaos.filter((o) => o.ativo).length;

  const toggle = (nome) =>
    setOrgaos((prev) => prev.map((o) => (o.nome === nome ? { ...o, ativo: !o.ativo } : o)));

  return (
    <section>
      <PageHeader
        title="Órgãos Públicos"
        subtitle={`${ativos} de ${orgaos.length} órgãos ativos no roteamento automático das denúncias.`}
      />

      <div className="org-grid">
        {/* Ranking */}
        <div className="card-surface">
          <div className="card-head">
            <h2>Encaminhamentos por órgão</h2>
            <span className="card-head-note">no mês</span>
          </div>
          <ul className="rank-list">
            {rankingOrgaos.map((o) => (
              <li key={o.nome} className="rank-row">
                <span className="rank-pos">{o.rank}</span>
                <div className="rank-body">
                  <div className="rank-top">
                    <span className="rank-nome">{o.nome}</span>
                    <span className="rank-count tnum">{o.count}</span>
                  </div>
                  <div className="rank-track">
                    <div className="rank-fill" style={{ width: `${o.pct}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Cadastro */}
        <div className="org-cadastro">
          {orgaos.map((o) => (
            <div key={o.nome} className={`card-surface org-card ${o.ativo ? '' : 'is-inativo'}`}>
              <div className="org-card-head">
                <span className="org-icon" aria-hidden="true">
                  <Icon name="building" size={20} />
                </span>
                <div className="org-id">
                  <strong>{o.nome}</strong>
                  <span>{o.descricao}</span>
                </div>
                <button
                  className={`toggle ${o.ativo ? 'on' : ''}`}
                  onClick={() => toggle(o.nome)}
                  role="switch"
                  aria-checked={o.ativo}
                  aria-label={`${o.ativo ? 'Desativar' : 'Ativar'} ${o.nome}`}
                >
                  <span className="toggle-knob" />
                </button>
              </div>

              <div className="org-cats">
                {o.categorias.map((c) => (
                  <span key={c} className="org-cat">
                    {c}
                  </span>
                ))}
              </div>

              <div className="org-foot">
                <span className="org-email">
                  <Icon name="mail" size={14} /> {o.email}
                </span>
                <span className="org-count tnum">
                  {o.count} denúncia{o.count === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

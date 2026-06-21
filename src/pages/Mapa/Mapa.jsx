import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import { CritBadge } from '../../components/Badges';
import { zonasMapa } from '../../data/mockDashboard';
import { critMeta, NIVEIS_CRITICIDADE, PESO_CRITICIDADE } from '../../data/criticidade';
import './Mapa.css';

const maxCount = Math.max(...zonasMapa.map((z) => z.count));

function tamanhoBolha(count) {
  // 28px a 60px conforme o volume.
  return 28 + (count / maxCount) * 32;
}

export default function Mapa() {
  const [ativo, setAtivo] = useState(zonasMapa[0].bairro);
  const zonaAtiva = zonasMapa.find((z) => z.bairro === ativo);
  const ordenadas = [...zonasMapa].sort((a, b) => b.count - a.count);

  return (
    <section>
      <PageHeader
        title="Mapa de criticidade"
        subtitle="Concentração de denúncias por região, em tempo real. Quanto maior o ponto, mais denúncias na área."
      />

      <div className="mapa-grid">
        {/* Mapa esquemático */}
        <div className="card-surface mapa-canvas-card">
          <div className="mapa-canvas" role="img" aria-label="Mapa esquemático de criticidade de Recife">
            {/* Fundo estilizado: litoral + rio Capibaribe */}
            <svg className="mapa-bg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="agua" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#e8f0fe" />
                  <stop offset="1" stopColor="#dfeaf8" />
                </linearGradient>
              </defs>
              {/* oceano à direita */}
              <path d="M82 0 L100 0 L100 100 L86 100 C90 70 80 40 82 0 Z" fill="url(#agua)" />
              {/* rio serpenteando */}
              <path
                d="M30 0 C34 18 22 30 30 44 C38 58 24 72 34 86 L40 100"
                fill="none"
                stroke="#cfe0f5"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M58 6 C54 24 66 34 58 50 C52 64 64 78 56 94"
                fill="none"
                stroke="#cfe0f5"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            {/* Bolhas */}
            {zonasMapa.map((z) => {
              const m = critMeta(z.criticidade);
              const size = tamanhoBolha(z.count);
              const isAtivo = z.bairro === ativo;
              return (
                <button
                  key={z.bairro}
                  className={`mapa-bolha ${isAtivo ? 'is-ativo' : ''}`}
                  style={{
                    left: `${z.x}%`,
                    top: `${z.y}%`,
                    width: size,
                    height: size,
                    '--c': m.color,
                  }}
                  onClick={() => setAtivo(z.bairro)}
                  onMouseEnter={() => setAtivo(z.bairro)}
                  aria-label={`${z.bairro}: ${z.count} denúncias, criticidade ${z.criticidade}`}
                >
                  <span className="bolha-count tnum">{z.count}</span>
                </button>
              );
            })}

            <span className="mapa-tag">Representação esquemática · dados mockados</span>
          </div>

          {/* Legenda */}
          <div className="mapa-legenda">
            {NIVEIS_CRITICIDADE.map((n) => {
              const m = critMeta(n);
              return (
                <span key={n} className="legenda-item">
                  <span className="legenda-dot" style={{ background: m.color }} />
                  {n}
                </span>
              );
            })}
          </div>
        </div>

        {/* Painel lateral */}
        <div className="mapa-side">
          {zonaAtiva && (
            <div className="card-surface zona-destaque" style={{ '--c': critMeta(zonaAtiva.criticidade).color }}>
              <span className="zona-destaque-eyebrow">
                <Icon name="pin" size={14} /> Região selecionada
              </span>
              <h2>{zonaAtiva.bairro}</h2>
              <div className="zona-destaque-stat">
                <strong className="tnum">{zonaAtiva.count}</strong>
                <span>denúncias ativas</span>
              </div>
              <CritBadge nivel={zonaAtiva.criticidade} />
            </div>
          )}

          <div className="card-surface">
            <div className="card-head">
              <h2>Regiões por volume</h2>
            </div>
            <ul className="zona-list">
              {ordenadas.map((z) => {
                const m = critMeta(z.criticidade);
                const pct = Math.round((z.count / maxCount) * 100);
                return (
                  <li
                    key={z.bairro}
                    className={`zona-row ${z.bairro === ativo ? 'is-ativo' : ''}`}
                    onMouseEnter={() => setAtivo(z.bairro)}
                    onClick={() => setAtivo(z.bairro)}
                  >
                    <div className="zona-row-top">
                      <span className="zona-nome">{z.bairro}</span>
                      <span className="zona-count tnum" style={{ color: m.color }}>
                        {z.count}
                      </span>
                    </div>
                    <div className="zona-track">
                      <div className="zona-fill" style={{ width: `${pct}%`, background: m.color }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

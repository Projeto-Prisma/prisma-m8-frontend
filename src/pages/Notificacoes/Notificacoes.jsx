import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import { notificacoes as base, TIPOS_NOTIFICACAO } from '../../data/mockNotificacoes';

import './Notificacoes.css';

const ICONE_TIPO = { pend: 'cpu', crit: 'alert', rec: 'repeat', enc: 'check', sys: 'bell' };

export default function Notificacoes() {
  const [itens, setItens] = useState(base);
  const [soNaoLidas, setSoNaoLidas] = useState(false);

  const naoLidas = itens.filter((n) => !n.lida).length;
  const lista = useMemo(
    () => (soNaoLidas ? itens.filter((n) => !n.lida) : itens),
    [itens, soNaoLidas]
  );

  const marcarTodas = () => setItens((prev) => prev.map((n) => ({ ...n, lida: true })));
  const marcarUma = (idx) =>
    setItens((prev) => prev.map((n, i) => (i === idx ? { ...n, lida: true } : n)));

  return (
    <section>
      <PageHeader
        title="Notificações"
        subtitle="Pendências, alertas de recorrência e encaminhamentos do sistema de triagem."
        actions={
          <>
            <button
              className={`chip-toggle ${soNaoLidas ? 'on' : ''}`}
              onClick={() => setSoNaoLidas((v) => !v)}
            >
              Só não lidas
              {naoLidas > 0 && <span className="chip-count tnum">{naoLidas}</span>}
            </button>
            <button className="btn-marcar" onClick={marcarTodas} disabled={naoLidas === 0}>
              <Icon name="check" size={15} /> Marcar todas como lidas
            </button>
          </>
        }
      />

      <ul className="notif-list">
        {lista.map((n) => {
          const idx = itens.indexOf(n);
          const meta = TIPOS_NOTIFICACAO[n.tipo];
          return (
            <li
              key={idx}
              className={`card-surface notif-item ${n.lida ? 'lida' : ''}`}
              onClick={() => marcarUma(idx)}
            >
              {!n.lida && <span className="notif-unread" aria-label="Não lida" />}
              <span className="notif-icon" style={{ color: meta.cor, background: meta.bg }}>
                <Icon name={ICONE_TIPO[n.tipo]} size={18} />
              </span>
              <div className="notif-body">
                <div className="notif-top">
                  <span className="notif-tipo" style={{ color: meta.cor }}>
                    {meta.rotulo}
                  </span>
                  <span className="notif-quando tnum">{n.quando}</span>
                </div>
                <p className="notif-texto">{n.texto}</p>
                {n.proto && (
                  <Link
                    to={`/denuncias/${n.proto}`}
                    className="notif-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Abrir protocolo #{n.proto} <Icon name="arrowRight" size={13} />
                  </Link>
                )}
              </div>
            </li>
          );
        })}

        {lista.length === 0 && (
          <li className="notif-empty">
            <Icon name="check" size={26} />
            <p>Tudo em dia. Nenhuma notificação não lida.</p>
          </li>
        )}
      </ul>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import { TIPOS_NOTIFICACAO } from '../../data/mockNotificacoes';
import { fetchNotificacoes, normalizarNotificacao, marcarNotificacaoLida, marcarTodasNotificacoesLidas } from '../../services/m6Service';
import './Notificacoes.css';

const ICONE_TIPO = { pend: 'cpu', crit: 'alert', rec: 'repeat', enc: 'check', sys: 'bell' };

export default function Notificacoes() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soNaoLidas, setSoNaoLidas] = useState(false);

  useEffect(() => {
    fetchNotificacoes(100)
      .then((data) => {
        setItens(data.map(normalizarNotificacao));
      })
      .catch(() => setItens([]))
      .finally(() => setLoading(false));
  }, []);

  const naoLidas = itens.filter((n) => !n.lida).length;
  const lista = useMemo(
    () => (soNaoLidas ? itens.filter((n) => !n.lida) : itens),
    [itens, soNaoLidas]
  );

  const marcarTodas = () => {
    setItens((prev) => prev.map((n) => ({ ...n, lida: true })));
    marcarTodasNotificacoesLidas().catch(() => {});
  };
  const marcarUma = (id) => {
    setItens((prev) => prev.map((n) => (n._id === id ? { ...n, lida: true } : n)));
    marcarNotificacaoLida(id).catch(() => {});
  };

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

      {loading && (
        <p style={{ padding: '24px', color: 'var(--muted)' }}>Carregando notificações…</p>
      )}

      <ul className="notif-list">
        {lista.map((n, idx) => {
          const meta = TIPOS_NOTIFICACAO[n.tipo] ?? TIPOS_NOTIFICACAO.sys;
          return (
            <li
              key={n._id ?? idx}
              className={`card-surface notif-item ${n.lida ? 'lida' : ''}`}
              onClick={() => marcarUma(n._id)}
            >
              {!n.lida && <span className="notif-unread" aria-label="Não lida" />}
              <span className="notif-icon" style={{ color: meta.cor, background: meta.bg }}>
                <Icon name={ICONE_TIPO[n.tipo] ?? 'bell'} size={18} />
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

        {!loading && lista.length === 0 && (
          <li className="notif-empty">
            <Icon name="check" size={26} />
            <p>
              {soNaoLidas
                ? 'Nenhuma notificação não lida.'
                : 'Nenhuma notificação registrada.'}
            </p>
          </li>
        )}
      </ul>
    </section>
  );
}

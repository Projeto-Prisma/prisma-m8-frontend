import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import { CritBadge, StatusBadge, IAVeredito, Card } from '../../components/Badges';
import {
  fetchDenunciaPorProtocolo,
  normalizarDenuncia,
  atualizarStatusDenuncia,
  confirmarAssuntoDenuncia,
  formatarData,
  statusEfetivo,
  encaminhadaEfetiva,
} from '../../services/denunciasService';
import { fetchM2Denuncia, fetchM2PorTexto, classificarTexto, revisarClassificacao } from '../../services/m2Service';
import { fetchM3Denuncia } from '../../services/m3Service';
import { fetchEncaminhamentoPorDenuncia, redirecionarEncaminhamento } from '../../services/m5Service';
import { fetchSecretarias } from '../../services/secretariasService';
import { fetchNotificacoesDenuncia } from '../../services/m6Service';
import { ASSUNTOS } from '../../data/mockProtocolo';
import './DenunciaDetalhe.css';

export default function DenunciaDetalhe() {
  const { proto } = useParams();
  const [d, setD]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]     = useState(null);
  const [atualizando, setAtualizando]   = useState(false);
  const [classificando, setClassificando] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  // Revisão humana: 'cid' | 'ia' | 'outro'
  const [opcaoRevisao, setOpcaoRevisao] = useState(null);
  const [assuntoOutro, setAssuntoOutro] = useState('');
  // Redirecionamento manual (Triagem Geral)
  const [orgaosDisponiveis, setOrgaosDisponiveis] = useState([]);
  const [carregandoOrgaos, setCarregandoOrgaos] = useState(false);
  const [mostrandoOrgaos, setMostrandoOrgaos] = useState(false);
  const [orgaoEscolhidoId, setOrgaoEscolhidoId] = useState(null);
  const [redirecionando, setRedirecionando] = useState(false);

  useEffect(() => {
    fetchDenunciaPorProtocolo(proto)
      .then(async (raw) => {
        if (!raw) { setErro('not-found'); return; }
        const [m2, m3, m5] = await Promise.all([
          raw.id
            ? fetchM2Denuncia(raw.id).catch(() => null)
            : fetchM2PorTexto(raw.descricao).catch(() => null),
          raw.id ? fetchM3Denuncia(raw.id).catch(() => null) : null,
          raw.id ? fetchEncaminhamentoPorDenuncia(raw.id).catch(() => null) : null,
        ]);
        setD({ ...normalizarDenuncia(raw, m2, m3, m5), id: raw.id, historico: raw.historico ?? [] });
        if (raw.id) {
          fetchNotificacoesDenuncia(raw.id)
            .then(setNotificacoes)
            .catch(() => {});
        }
      })
      .catch(() => setErro('erro'))
      .finally(() => setLoading(false));
  }, [proto]);

  // Pré-seleciona a opção de revisão ao carregar uma denúncia pendente
  useEffect(() => {
    if (!d || d.statusRaw !== 'PENDENTE_DE_REVISAO') return;
    const div = Boolean(d.assuntoIA) && d.assuntoCid !== d.assuntoIA;
    // Sem divergência (só baixa confiança): pré-seleciona o assunto do cidadão
    if (!div) setOpcaoRevisao('cid');
    // Com divergência: sem pré-seleção, força escolha manual
  }, [d?.id, d?.statusRaw]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-classifica quando não há dados do M2
  useEffect(() => {
    if (!d || d.assuntoIA !== null || d.revisar) return;
    setClassificando(true);
    classificarTexto(d.texto)
      .then((resultado) => {
        setD((prev) => ({
          ...prev,
          assuntoIA: resultado.categoria_sugerida ?? resultado.categoria ?? null,
          confianca: resultado.confianca != null ? Math.round(resultado.confianca * 100) : null,
          revisar:   resultado.revisar ?? false,
          area:      resultado.area_responsavel ?? null,
        }));
      })
      .catch(() => {})
      .finally(() => setClassificando(false));
  }, [d?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const confirmarEncaminhamento = async () => {
    if (!d?.id) return;
    setAtualizando(true);
    try {
      const assuntoEscolhido =
        opcaoRevisao === 'cid' ? d.assuntoCid :
        opcaoRevisao === 'ia'  ? d.assuntoIA  :
        opcaoRevisao === 'outro' ? assuntoOutro : d.assuntoCid;

      const precisaRevisao = Boolean(d.revisar || (d.assuntoIA && d.assuntoCid !== d.assuntoIA));

      if (precisaRevisao) {
        // Libera o gate: publica denuncia.classificada → M3 → M5 → M6
        await revisarClassificacao(d.id, assuntoEscolhido);
      } else if (assuntoEscolhido && assuntoEscolhido !== d.assuntoCid) {
        await confirmarAssuntoDenuncia(d.id, assuntoEscolhido);
      }

      await atualizarStatusDenuncia(d.id, 'ENCAMINHADA');

      // Refaz fetch de M3/M5 para mostrar órgão e criticidade recém-calculados
      const [m3New, m5New] = await Promise.all([
        fetchM3Denuncia(d.id).catch(() => null),
        fetchEncaminhamentoPorDenuncia(d.id).catch(() => null),
      ]);
      const nivelParaLabel = { CRITICO: 'Crítico', ALTO: 'Alto', MEDIO: 'Médio', BAIXO: 'Baixo' };
      setD((prev) => ({
        ...prev,
        assuntoCid: assuntoEscolhido ?? prev.assuntoCid,
        status: 'Encaminhada',
        statusRaw: 'ENCAMINHADA',
        revisar: false,
        divergencia: false,
        criticidade: m3New ? (nivelParaLabel[m3New.nivel] ?? m3New.nivel) : prev.criticidade,
        score: m3New?.score ?? prev.score,
        orgao: m5New?.secretariaNome ?? prev.orgao,
        orgaoSigla: m5New?.secretariaSigla ?? prev.orgaoSigla,
        orgaoId: m5New?.secretariaId ?? prev.orgaoId,
      }));
    } catch (e) {
      alert(`Erro ao atualizar: ${e.message}`);
    } finally {
      setAtualizando(false);
    }
  };

  const abrirOrgaos = async () => {
    if (mostrandoOrgaos) { setMostrandoOrgaos(false); return; }
    setCarregandoOrgaos(true);
    try {
      const todos = await fetchSecretarias();
      const relevant = (s) => s.categorias?.some((c) => c === d.assuntoCid || c === d.assuntoIA);
      setOrgaosDisponiveis([
        ...todos.filter(relevant),
        ...todos.filter((s) => !relevant(s)),
      ]);
      setMostrandoOrgaos(true);
    } catch (e) {
      alert(`Erro ao carregar órgãos: ${e.message}`);
    } finally {
      setCarregandoOrgaos(false);
    }
  };

  const confirmarRedirecionamento = async () => {
    if (!d?.id || !orgaoEscolhidoId) return;
    setRedirecionando(true);
    try {
      const resultado = await redirecionarEncaminhamento(d.id, orgaoEscolhidoId);
      setD((prev) => ({
        ...prev,
        orgao: resultado.secretariaNome,
        orgaoSigla: resultado.secretariaSigla,
        orgaoId: resultado.secretariaId,
      }));
      setMostrandoOrgaos(false);
      setOrgaoEscolhidoId(null);
    } catch (e) {
      alert(`Erro ao redirecionar: ${e.message}`);
    } finally {
      setRedirecionando(false);
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
  const encaminhada = encaminhadaEfetiva(d);
  const precisaRevisao = Boolean(d.revisar || (d.assuntoIA && d.assuntoCid !== d.assuntoIA));
  const pendente = precisaRevisao && !encaminhada;

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
          <StatusBadge status={statusEfetivo(d)} />
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
            {classificando ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '14px 0' }}>
                Classificando…
              </p>
            ) : (
              <>
                <IAVeredito denuncia={d} />
                {divergente && (
                  <p className="det-ia-hint">
                    A IA discorda do assunto informado. Revise antes de encaminhar.
                  </p>
                )}
              </>
            )}
          </Card>

          <Card className="det-route-card">
            <h2>Encaminhamento</h2>
            {d.orgao ? (
              <>
                <div className="route-orgao">
                  <span className="route-orgao-icon" aria-hidden="true">
                    <Icon name="building" size={18} />
                  </span>
                  <div>
                    <strong>{d.orgao}</strong>
                    <span>
                      {d.orgaoSigla && `${d.orgaoSigla} · `}órgão responsável
                      {d.score != null && ` · score ${Math.round(d.score)}`}
                    </span>
                  </div>
                </div>
                {d.orgaoId === null && (
                  <>
                    <div className="route-fallback-warn">
                      <Icon name="alert" size={14} />
                      Órgão sugerido automaticamente — ainda não cadastrado em Órgãos Públicos.{' '}
                      <Link to="/orgaos">Cadastre-o em Órgãos</Link> para que o roteamento pare de usar o valor de fallback.
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost route-redirect-btn"
                      onClick={abrirOrgaos}
                      disabled={carregandoOrgaos}
                    >
                      <Icon name="building" size={15} />
                      {carregandoOrgaos ? 'Carregando…' : mostrandoOrgaos ? 'Fechar lista' : 'Verificar órgãos disponíveis'}
                    </button>
                    {mostrandoOrgaos && (
                      <div className="route-redirect-panel">
                        <p className="route-redirect-hint">
                          Selecione o órgão responsável. Os marcados com ★ atendem a categoria desta denúncia.
                        </p>
                        <ul className="route-redirect-list">
                          {orgaosDisponiveis.map((s) => {
                            const destaque = s.categorias?.some(
                              (c) => c === d.assuntoCid || c === d.assuntoIA
                            );
                            return (
                              <li
                                key={s.id}
                                className={`route-redirect-item ${orgaoEscolhidoId === s.id ? 'is-on' : ''}`}
                                onClick={() => setOrgaoEscolhidoId(s.id)}
                              >
                                {destaque && <span className="route-redirect-star" title="Atende a categoria desta denúncia">★</span>}
                                <span className="route-redirect-nome">{s.nome}</span>
                                <span className="route-redirect-sigla">{s.sigla}</span>
                              </li>
                            );
                          })}
                        </ul>
                        <button
                          type="button"
                          className="btn btn-brand"
                          onClick={confirmarRedirecionamento}
                          disabled={!orgaoEscolhidoId || redirecionando}
                        >
                          <Icon name="check" size={15} />
                          {redirecionando ? 'Redirecionando…' : 'Confirmar redirecionamento'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '14px 0 18px' }}>
                Órgão destino ainda não definido — aguardando M5 (roteamento).
              </p>
            )}

            {pendente && (
              <div className="route-actions">
                <p className="det-revisao-titulo">Escolha o assunto final antes de encaminhar:</p>

                <label className={`det-revisao-opcao ${opcaoRevisao === 'cid' ? 'is-on' : ''}`}>
                  <input
                    type="radio"
                    name="revisao"
                    value="cid"
                    checked={opcaoRevisao === 'cid'}
                    onChange={() => setOpcaoRevisao('cid')}
                  />
                  <strong>A) Aceitar classificação do cidadão</strong>
                  <span className="det-revisao-val">{d.assuntoCid}</span>
                </label>

                {d.assuntoIA && (
                  <label className={`det-revisao-opcao ${opcaoRevisao === 'ia' ? 'is-on' : ''}`}>
                    <input
                      type="radio"
                      name="revisao"
                      value="ia"
                      checked={opcaoRevisao === 'ia'}
                      onChange={() => setOpcaoRevisao('ia')}
                    />
                    <strong>B) Aceitar classificação da IA</strong>
                    <span className="det-revisao-val">{d.assuntoIA}</span>
                  </label>
                )}

                <label className={`det-revisao-opcao ${opcaoRevisao === 'outro' ? 'is-on' : ''}`}>
                  <input
                    type="radio"
                    name="revisao"
                    value="outro"
                    checked={opcaoRevisao === 'outro'}
                    onChange={() => setOpcaoRevisao('outro')}
                  />
                  <strong>C) Definir outro assunto</strong>
                  {opcaoRevisao === 'outro' && (
                    <select
                      className="det-revisao-select"
                      value={assuntoOutro}
                      onChange={(e) => setAssuntoOutro(e.target.value)}
                    >
                      <option value="" disabled>Selecione o assunto</option>
                      {ASSUNTOS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  )}
                </label>

                <button
                  className="btn btn-ia"
                  type="button"
                  onClick={confirmarEncaminhamento}
                  disabled={
                    atualizando ||
                    !opcaoRevisao ||
                    (opcaoRevisao === 'outro' && !assuntoOutro)
                  }
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

          {notificacoes.length > 0 && (
            <Card className="det-notif-card">
              <h2><Icon name="bell" size={16} /> Notificações enviadas</h2>
              <ul className="det-notif-list">
                {notificacoes.map((n) => (
                  <li key={n.id} className="det-notif-item">
                    <span className="det-notif-tipo">{n.tipo}</span>
                    <span className="det-notif-dest">{n.destinatario}</span>
                    <span className="det-notif-status">{n.status}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
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
    const confDesc = d.confianca ? ` · confiança ${d.confianca}%` : '';
    const revisarDesc = d.revisar ? ' — baixa confiança, revisar' : '';
    const divergDesc = !d.revisar && divergente ? ' — divergência com o informado' : '';
    etapas.push({
      titulo: d.revisar ? 'Sugestão da IA (baixa confiança)' : 'Classificada pela IA',
      desc: `Assunto sugerido: ${d.assuntoIA}${confDesc}${revisarDesc}${divergDesc}`,
      done: !d.revisar,
      atual: d.revisar,
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
    const scoreDesc = d.score != null ? ` · score ${Math.round(d.score)}` : '';
    etapas.push({
      titulo: `Prioridade: ${d.criticidade}`,
      desc: `Score de criticidade calculado pelo M3${scoreDesc}.`,
      done: true,
    });
  }

  if (pendente) {
    const motivoPendencia = divergente
      ? 'Assunto da IA difere do informado pelo cidadão.'
      : 'Confiança da IA abaixo do limiar mínimo.';
    etapas.push({
      titulo: 'Pendente de revisão',
      desc: `${motivoPendencia} Aguardando confirmação humana.`,
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

import { useState, useEffect, useRef } from 'react';
import PageHeader from '../../components/PageHeader';
import Icon from '../../components/Icon';
import { rankingOrgaos } from '../../data/mockOrgaos';
import {
  fetchSecretarias,
  createSecretaria,
  updateSecretaria,
  toggleSecretaria,
} from '../../services/secretariasService';
import './Orgaos.css';

const FORM_VAZIO = { nome: '', sigla: '', email: '', categorias: '' };
const OPCOES_POR_PAGINA = [5, 10, 20];

function formParaPayload(form) {
  return {
    nome: form.nome.trim(),
    sigla: form.sigla.trim().toUpperCase(),
    categorias: form.categorias
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    contatos: { email: form.email.trim() },
  };
}

function secretariaParaForm(o) {
  return {
    nome: o.nome,
    sigla: o.sigla,
    email: o.contatos?.email ?? '',
    categorias: (o.categorias ?? []).join(', '),
  };
}

function validar(form) {
  if (!form.nome.trim()) return 'O nome é obrigatório.';
  if (!form.sigla.trim()) return 'A sigla é obrigatória.';
  if (!form.email.trim()) return 'O e-mail é obrigatório.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Informe um e-mail válido.';
  if (!form.categorias.trim()) return 'Informe ao menos uma categoria.';
  return '';
}

export default function Orgaos() {
  const [orgaos, setOrgaos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [porPagina, setPorPagina] = useState(5);
  const [pagina, setPagina] = useState(1);

  // modal de criação/edição
  const [modal, setModal] = useState(null); // null | { modo: 'criar' | 'editar', orgao?: obj }
  const [form, setForm] = useState(FORM_VAZIO);
  const [formErro, setFormErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const nomeRef = useRef(null);
  const ativos = orgaos.filter((o) => o.ativo).length;

  const orgaosFiltrados = busca.trim()
    ? orgaos.filter((o) => {
        const q = busca.trim().toLowerCase();
        return (
          o.nome.toLowerCase().includes(q) ||
          o.sigla.toLowerCase().includes(q) ||
          o.categorias.some((c) => c.toLowerCase().includes(q))
        );
      })
    : orgaos;

  const totalPaginas = Math.max(1, Math.ceil(orgaosFiltrados.length / porPagina));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const orgaosPagina = orgaosFiltrados.slice(
    (paginaSegura - 1) * porPagina,
    paginaSegura * porPagina,
  );

  const mudarBusca = (valor) => { setBusca(valor); setPagina(1); };
  const mudarPorPagina = (valor) => { setPorPagina(Number(valor)); setPagina(1); };

  useEffect(() => {
    fetchSecretarias()
      .then(setOrgaos)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (modal) setTimeout(() => nomeRef.current?.focus(), 50);
  }, [modal]);

  const abrirCriar = () => {
    setForm(FORM_VAZIO);
    setFormErro('');
    setModal({ modo: 'criar' });
  };

  const abrirEditar = (o) => {
    setForm(secretariaParaForm(o));
    setFormErro('');
    setModal({ modo: 'editar', orgao: o });
  };

  const fecharModal = () => {
    if (salvando) return;
    setModal(null);
  };

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const salvar = async () => {
    const msg = validar(form);
    if (msg) { setFormErro(msg); return; }
    setFormErro('');
    setSalvando(true);
    try {
      const payload = formParaPayload(form);
      if (modal.modo === 'criar') {
        const nova = await createSecretaria(payload);
        setOrgaos((prev) => [...prev, nova]);
      } else {
        const atualizada = await updateSecretaria(modal.orgao.id, payload);
        setOrgaos((prev) => prev.map((o) => (o.id === atualizada.id ? atualizada : o)));
      }
      setModal(null);
    } catch (e) {
      setFormErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const toggle = (id, ativoAtual) =>
    toggleSecretaria(id, !ativoAtual)
      .then((atualizada) =>
        setOrgaos((prev) => prev.map((o) => (o.id === id ? atualizada : o)))
      )
      .catch((e) => setErro(e.message));

  return (
    <section>
      <PageHeader
        title="Órgãos Públicos"
        subtitle={
          loading
            ? 'Carregando...'
            : erro
            ? `Erro: ${erro}`
            : `${ativos} de ${orgaos.length} órgãos ativos no roteamento automático das denúncias.`
        }
        search={busca}
        onSearch={mudarBusca}
        searchPlaceholder="Buscar por nome, sigla ou categoria"
        actions={
          <button className="org-btn-novo" onClick={abrirCriar}>
            <Icon name="plus" size={15} strokeWidth={2.4} /> Novo órgão
          </button>
        }
      />

      <div className="org-grid">
        {/* Ranking — virá do M7 (analytics); exibe mock até lá */}
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
          {/* Controles de paginação — topo */}
          {!loading && orgaosFiltrados.length > 0 && (
            <div className="org-pag-bar">
              <span className="org-pag-info">
                {orgaosFiltrados.length === orgaos.length
                  ? `${orgaos.length} órgão${orgaos.length !== 1 ? 's' : ''}`
                  : `${orgaosFiltrados.length} resultado${orgaosFiltrados.length !== 1 ? 's' : ''}`}
              </span>
              <label className="org-pag-select-label">
                Exibir
                <select
                  className="org-pag-select"
                  value={porPagina}
                  onChange={(e) => mudarPorPagina(e.target.value)}
                >
                  {OPCOES_POR_PAGINA.map((n) => (
                    <option key={n} value={n}>{n} por página</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {loading && <p className="org-loading">Carregando órgãos...</p>}
          {!loading && orgaosFiltrados.length === 0 && (
            <div className="den-empty">
              <Icon name="search" size={28} />
              <p>Nenhum órgão encontrado para essa busca.</p>
              <button className="link-more" onClick={() => mudarBusca('')}>Limpar busca</button>
            </div>
          )}
          {!loading &&
            orgaosPagina.map((o) => (
              <div key={o.id} className={`card-surface org-card ${o.ativo ? '' : 'is-inativo'}`}>
                <div className="org-card-head">
                  <span className="org-icon" aria-hidden="true">
                    <Icon name="building" size={20} />
                  </span>
                  <div className="org-id">
                    <strong>{o.nome}</strong>
                    <span>{o.sigla}</span>
                  </div>
                  <button
                    className="org-btn-edit"
                    onClick={() => abrirEditar(o)}
                    aria-label={`Editar ${o.nome}`}
                    title="Editar"
                  >
                    <Icon name="edit" size={14} />
                  </button>
                  <button
                    className={`toggle ${o.ativo ? 'on' : ''}`}
                    onClick={() => toggle(o.id, o.ativo)}
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
                    <Icon name="mail" size={14} /> {o.contatos?.email ?? '—'}
                  </span>
                </div>
              </div>
            ))}
          {/* Navegação entre páginas */}
          {!loading && totalPaginas > 1 && (
            <div className="org-pag-nav">
              <button
                className="org-pag-btn"
                onClick={() => setPagina((p) => p - 1)}
                disabled={paginaSegura === 1}
                aria-label="Página anterior"
              >
                <Icon name="arrowLeft" size={15} />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`org-pag-btn ${n === paginaSegura ? 'is-active' : ''}`}
                  onClick={() => setPagina(n)}
                  aria-current={n === paginaSegura ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}

              <button
                className="org-pag-btn"
                onClick={() => setPagina((p) => p + 1)}
                disabled={paginaSegura === totalPaginas}
                aria-label="Próxima página"
              >
                <Icon name="arrowRight" size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal criação / edição */}
      {modal && (
        <div className="org-overlay" onClick={fecharModal}>
          <div className="org-modal card-surface" onClick={(e) => e.stopPropagation()}>
            <div className="org-modal-head">
              <h2>{modal.modo === 'criar' ? 'Novo órgão público' : 'Editar órgão'}</h2>
              <button className="org-modal-close" onClick={fecharModal} aria-label="Fechar">
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="org-modal-body">
              <div className="org-form-row">
                <div className="org-field">
                  <label className="org-label">Nome <span className="org-req">*</span></label>
                  <input
                    ref={nomeRef}
                    className="org-input"
                    value={form.nome}
                    onChange={set('nome')}
                    placeholder="Ex: Secretaria de Saúde"
                  />
                </div>
                <div className="org-field org-field-sm">
                  <label className="org-label">Sigla <span className="org-req">*</span></label>
                  <input
                    className="org-input"
                    value={form.sigla}
                    onChange={set('sigla')}
                    placeholder="Ex: SMS"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div className="org-field">
                <label className="org-label">E-mail de contato <span className="org-req">*</span></label>
                <input
                  className="org-input"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="orgao@prefeitura.gov.br"
                />
              </div>

              <div className="org-field">
                <label className="org-label">
                  Categorias atendidas <span className="org-req">*</span>
                  <span className="org-label-hint"> — separe por vírgula</span>
                </label>
                <input
                  className="org-input"
                  value={form.categorias}
                  onChange={set('categorias')}
                  placeholder="Ex: Saúde Pública, Saneamento, Vigilância"
                />
              </div>

              {formErro && (
                <div className="org-form-erro">
                  <Icon name="alert" size={15} /> {formErro}
                </div>
              )}
            </div>

            <div className="org-modal-foot">
              <button className="org-btn-ghost" onClick={fecharModal} disabled={salvando}>
                Cancelar
              </button>
              <button className="org-btn-primary" onClick={salvar} disabled={salvando}>
                {salvando ? 'Salvando…' : modal.modo === 'criar' ? 'Cadastrar' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicTopbar from '../../components/PublicTopbar';
import Icon from '../../components/Icon';
import {
  ASSUNTOS,
  PROFISSOES,
  TIPOS_DOC,
  SEXOS,
  GENEROS,
  ONDES,
} from '../../data/mockProtocolo';
import { submitDenuncia } from '../../services/denunciasService';
import './Denunciar.css';

const STEP_LABELS = ['Dados da Manifestação', 'Incluir Anexo', 'Revise os Dados', 'Protocolo'];
const DESC_MAX = 600;

const novoCaptcha = () => String(Math.floor(10000 + Math.random() * 90000));

const FORM_INICIAL = {
  nome: '',
  profissao: '',
  tipoDoc: '',
  numeroDoc: '',
  sexo: '',
  genero: '',
  celular: '',
  email: '',
  onde: 'Recife',
  protoAnterior: '',
  assunto: '',
  descricao: '',
};

export default function Denunciar() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [tipo, setTipo] = useState('cidadao'); // anonimo | cidadao | servidor
  const [sigilo, setSigilo] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [captcha, setCaptcha] = useState(novoCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [foto, setFoto] = useState(null); // { name, url }
  const [erro, setErro] = useState('');
  const [proto, setProto] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const anon = tipo === 'anonimo';
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const stepperItems = useMemo(
    () =>
      STEP_LABELS.map((label, i) => ({
        label,
        num: i < step ? '✓' : String(i + 1),
        done: i < step,
        current: i === step,
        clickable: i < step,
      })),
    [step]
  );

  const validarStep0 = () => {
    if (!form.assunto) return 'Selecione o assunto da denúncia.';
    if (form.descricao.trim().length < 10) return 'Descreva o problema com pelo menos 10 caracteres.';
    if (!anon && !form.nome.trim()) return 'Informe seu nome (ou registre como anônimo).';
    if (!anon && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Informe um e-mail válido.';
    if (captchaInput.trim() !== captcha) return 'Captcha incorreto. Digite os números exibidos.';
    return '';
  };

  const avancar = async () => {
    if (step === 0) {
      const msg = validarStep0();
      if (msg) { setErro(msg); return; }
    }
    setErro('');

    if (step === 2) {
      setEnviando(true);
      try {
        const payload = {
          assunto: form.assunto,
          descricao: form.descricao,
          onde: form.onde,
          protocoloAnterior: form.protoAnterior || null,
          manifestante: {
            tipo: tipo.toUpperCase(),
            sigilo,
            nome: form.nome || null,
            profissao: form.profissao || null,
            tipoDoc: form.tipoDoc || null,
            numeroDoc: form.numeroDoc || null,
            sexo: form.sexo || null,
            genero: form.genero || null,
            celular: form.celular || null,
            email: form.email || null,
          },
        };
        const resultado = await submitDenuncia(payload);
        setProto(resultado.protocolo);
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        setErro(`Erro ao registrar: ${e.message}`);
      } finally {
        setEnviando(false);
      }
      return;
    }

    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const voltar = () => {
    setErro('');
    setStep((s) => Math.max(0, s - 1));
  };

  const irParaStep = (i) => {
    if (i < step) {
      setErro('');
      setStep(i);
    }
  };

  const limpar = () => {
    setForm(FORM_INICIAL);
    setCaptchaInput('');
    setCaptcha(novoCaptcha());
    setFoto(null);
    setErro('');
  };

  const onFoto = (e) => {
    const file = e.target.files?.[0];
    if (file) setFoto({ name: file.name, url: URL.createObjectURL(file) });
  };

  const tipoManifestante = anon ? 'Anônimo' : tipo === 'servidor' ? 'Servidor(a)' : 'Cidadã(o)';

  const actions = (
    <button type="button" className="pub-link-back" onClick={() => navigate('/portal')}>
      ← Voltar ao início
    </button>
  );

  return (
    <div className="den-page">
      <PublicTopbar actions={actions} />

      <div className="den-banner">
        <h1>Faça sua Denúncia</h1>
        <p>Registre um problema urbano em poucos passos</p>
      </div>

      {/* Stepper */}
      <div className="den-stepper-wrap">
        <div className="den-stepper">
          {stepperItems.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`den-step ${s.current ? 'is-current' : ''} ${s.done ? 'is-done' : ''}`}
              onClick={() => irParaStep(i)}
              disabled={!s.clickable && !s.current}
            >
              <span className="den-step-dot">{s.num}</span>
              <span className="den-step-label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="den-body">
        {/* STEP 0 — dados */}
        {step === 0 && (
          <div className="den-card">
            <div className="den-required-note">
              Os campos sinalizados com asteriscos (*) são de preenchimento obrigatório.
            </div>

            <div className="den-radios">
              {[
                { id: 'anonimo', label: 'Anônimo' },
                { id: 'cidadao', label: 'Cidadão' },
                { id: 'servidor', label: 'Servidor' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`den-radio ${tipo === opt.id ? 'is-on' : ''}`}
                  onClick={() => setTipo(opt.id)}
                >
                  <span className="den-radio-mark" />
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`den-check ${sigilo ? 'is-on' : ''}`}
              onClick={() => setSigilo((v) => !v)}
            >
              <span className="den-check-box">{sigilo && <Icon name="check" size={12} strokeWidth={2.6} />}</span>
              Desejo manter o sigilo no atendimento
            </button>

            <fieldset className="den-grid" disabled={anon}>
              <Field label="Nome" required>
                <input value={form.nome} onChange={set('nome')} placeholder="Seu nome completo" />
              </Field>
              <Field label="Profissão" required>
                <Select value={form.profissao} onChange={set('profissao')} placeholder="Selecione a profissão" options={PROFISSOES} />
              </Field>
              <Field label="Tipo Doc.">
                <Select value={form.tipoDoc} onChange={set('tipoDoc')} placeholder="Selecione o tipo" options={TIPOS_DOC} />
              </Field>
              <Field label="Número Doc.">
                <input value={form.numeroDoc} onChange={set('numeroDoc')} placeholder="000.000.000-00" />
              </Field>
              <Field label="Sexo" required>
                <Select value={form.sexo} onChange={set('sexo')} placeholder="Selecione o sexo" options={SEXOS} />
              </Field>
              <Field label="Gênero" required>
                <Select value={form.genero} onChange={set('genero')} placeholder="Selecione a identidade" options={GENEROS} />
              </Field>
              <Field label="Celular" required>
                <input value={form.celular} onChange={set('celular')} placeholder="(81) 90000-0000" />
              </Field>
              <Field label="Email" required>
                <input type="email" value={form.email} onChange={set('email')} placeholder="voce@email.com" />
              </Field>
              <Field label="Onde" required>
                <Select value={form.onde} onChange={set('onde')} placeholder="Selecione" options={ONDES} />
              </Field>
              <Field label="Protocolo Anterior">
                <input value={form.protoAnterior} onChange={set('protoAnterior')} placeholder="Deixe em branco se for novo" />
              </Field>
            </fieldset>

            {anon && (
              <p className="den-anon-hint">
                <Icon name="info" size={14} /> Denúncia anônima: os dados de identificação ficam desabilitados.
              </p>
            )}

            {/* Assunto */}
            <div className="den-field-full">
              <label className="den-label">
                Assunto <span className="den-req">*</span>{' '}
                <span className="den-label-hint">(selecione o mais próximo)</span>
              </label>
              <Select
                value={form.assunto}
                onChange={set('assunto')}
                placeholder="Selecione o assunto"
                options={ASSUNTOS}
                highlight
              />
              <div className="den-ai-notice">
                <Icon name="info" size={17} />
                <div>
                  <strong>Como funciona a classificação automática</strong>
                  <span>
                    Você escolhe o assunto mais próximo. Nossa IA analisa o texto da sua denúncia e
                    confirma a categoria automaticamente. Se houver divergência, sua denúncia passa por
                    uma revisão antes de ser encaminhada.
                  </span>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="den-field-full">
              <label className="den-label">
                Descrição da manifestação <span className="den-req">*</span>
              </label>
              <textarea
                className="den-textarea"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value.slice(0, DESC_MAX) }))}
                placeholder="Descreva o que está acontecendo, onde e há quanto tempo…"
                rows={4}
              />
              <div className="den-counter tnum">
                {form.descricao.length} / {DESC_MAX} caracteres
              </div>
            </div>

            {/* Captcha */}
            <div className="den-captcha">
              <label className="den-label den-captcha-label">
                Captcha de validação <span className="den-req">*</span>
              </label>
              <span className="den-captcha-code tnum">{captcha}</span>
              <button
                type="button"
                className="den-captcha-refresh"
                onClick={() => setCaptcha(novoCaptcha())}
                title="Gerar novo captcha"
              >
                <Icon name="repeat" size={15} />
              </button>
              <input
                className="den-captcha-input tnum"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="_ _ _ _ _"
                inputMode="numeric"
              />
              <span className="den-captcha-help">Digite os números acima</span>
            </div>

            {erro && (
              <div className="den-error">
                <Icon name="alert" size={17} /> {erro}
              </div>
            )}

            <div className="den-actions den-actions-end">
              <button type="button" className="den-btn-ghost" onClick={limpar}>
                Limpar
              </button>
              <button type="button" className="den-btn-primary" onClick={avancar}>
                Avançar <Icon name="arrowRight" size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1 — anexo + localização */}
        {step === 1 && (
          <div className="den-card">
            <h3 className="den-card-title">Incluir Anexo e Localização</h3>

            <label className="den-label">Foto do problema</label>
            <label className={`den-dropzone ${foto ? 'has-file' : ''}`}>
              <input type="file" accept="image/png,image/jpeg" hidden onChange={onFoto} />
              {foto ? (
                <div className="den-dropzone-preview">
                  <img src={foto.url} alt="Pré-visualização" />
                  <div className="den-dropzone-file">
                    <Icon name="check" size={16} strokeWidth={2.4} /> {foto.name}
                  </div>
                  <span className="den-dropzone-change">Clique para trocar</span>
                </div>
              ) : (
                <>
                  <span className="den-dropzone-icon">
                    <Icon name="camera" size={24} />
                  </span>
                  <strong>Arraste uma foto ou clique para selecionar</strong>
                  <span className="den-dropzone-hint">PNG ou JPG · até 10 MB</span>
                </>
              )}
            </label>

            <label className="den-label" style={{ marginTop: 22 }}>
              Localização no mapa
            </label>
            <div className="den-map">
              <span className="den-map-pin" />
              <span className="den-map-addr">
                {form.onde === 'Recife' ? 'Av. Caxangá, Várzea · Recife' : `${form.onde}`}
              </span>
              <button type="button" className="den-map-locate">
                <Icon name="target" size={14} /> Minha localização
              </button>
            </div>

            <div className="den-actions den-actions-between">
              <button type="button" className="den-btn-ghost" onClick={voltar}>
                ← Voltar
              </button>
              <button type="button" className="den-btn-primary" onClick={avancar}>
                Avançar <Icon name="arrowRight" size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — revisão */}
        {step === 2 && (
          <div className="den-card">
            <h3 className="den-card-title">Revise os Dados</h3>
            <div className="den-review">
              <Review label="Manifestante" value={anon ? 'Anônimo' : `${form.nome || '—'} · ${tipoManifestante}`} />
              <Review label="Assunto informado" value={form.assunto || '—'} />
              <Review label="Descrição" value={form.descricao || '—'} full />
              <Review label="Localização" value={`${form.onde}`} />
              <Review
                label="Foto"
                value={
                  foto ? (
                    <span className="den-review-file">
                      <Icon name="check" size={15} strokeWidth={2.4} /> {foto.name}
                    </span>
                  ) : (
                    'Nenhuma foto anexada'
                  )
                }
              />
            </div>
            <div className="den-confirm-note">
              Ao confirmar, sua denúncia será processada automaticamente pela IA. Você receberá um
              número de protocolo para acompanhamento.
            </div>
            {erro && (
              <div className="den-error">
                <Icon name="alert" size={17} /> {erro}
              </div>
            )}
            <div className="den-actions den-actions-between">
              <button type="button" className="den-btn-ghost" onClick={voltar}>
                ← Voltar
              </button>
              <button type="button" className="den-btn-primary" onClick={avancar} disabled={enviando}>
                {enviando ? 'Enviando…' : 'Confirmar e enviar'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — sucesso */}
        {step === 3 && (
          <div className="den-card den-success">
            <span className="den-success-icon">
              <Icon name="check" size={34} strokeWidth={2.6} />
            </span>
            <h2>Denúncia registrada com sucesso!</h2>
            <p>
              Sua denúncia entrou na triagem automática. Acompanhe o andamento pelo número de
              protocolo abaixo.
            </p>
            <div className="den-proto-box">
              <span>Número de protocolo</span>
              <strong className="tnum">{proto}</strong>
            </div>
            <div className="den-actions den-actions-center">
              <Link to={`/acompanhar?proto=${proto}`} className="den-btn-primary den-btn-link">
                Acompanhar minha denúncia
              </Link>
              <Link to="/portal" className="den-btn-ghost den-btn-link">
                Voltar ao início
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Subcomponentes de formulário ---------- */
function Field({ label, required, children }) {
  return (
    <div className="den-field">
      <label className="den-label">
        {label} {required && <span className="den-req">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({ value, onChange, placeholder, options, highlight }) {
  return (
    <div className={`den-select ${highlight ? 'is-highlight' : ''} ${value ? 'has-value' : ''}`}>
      <select value={value} onChange={onChange}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" size={16} className="den-select-chevron" />
    </div>
  );
}

function Review({ label, value, full }) {
  return (
    <div className={`den-review-item ${full ? 'is-full' : ''}`}>
      <span className="den-review-label">{label}</span>
      <div className="den-review-value">{value}</div>
    </div>
  );
}

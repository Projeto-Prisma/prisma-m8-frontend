const BASE_URL = import.meta.env.VITE_M1_URL ?? 'http://localhost:8001';

export const STATUS_LABEL = {
  RECEBIDA: 'Recebida',
  CLASSIFICADA: 'Classificada',
  PRIORIZADA: 'Priorizada',
  PENDENTE_DE_REVISAO: 'Pendente de revisão',
  ENCAMINHADA: 'Encaminhada',
};

async function wrapFetch(url, opcoes) {
  try {
    return await fetch(url, opcoes);
  } catch (e) {
    if (e instanceof TypeError)
      throw new Error('Não foi possível conectar ao serviço de Ingestão (M1). Verifique se ele está em execução.');
    throw e;
  }
}

async function handleResponse(res, mensagemPadrao) {
  if (!res.ok) {
    let detalhe = mensagemPadrao;
    try {
      const corpo = await res.json();
      if (corpo?.message) detalhe = corpo.message;
      else if (corpo?.detail) detalhe = corpo.detail;
    } catch (_) {}
    throw new Error(detalhe);
  }
  return res.json();
}

export async function submitDenuncia(payload) {
  const res = await wrapFetch(`${BASE_URL}/denuncias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, 'Falha ao registrar denúncia');
}

export async function fetchDenuncias() {
  const res = await wrapFetch(`${BASE_URL}/denuncias`);
  return handleResponse(res, 'Falha ao carregar denúncias');
}

export async function fetchDenunciaPorProtocolo(protocolo) {
  const res = await wrapFetch(`${BASE_URL}/denuncias/protocolo/${encodeURIComponent(protocolo)}`);
  if (res.status === 404) return null;
  return handleResponse(res, 'Falha ao buscar denúncia');
}

export async function atualizarStatusDenuncia(id, novoStatus) {
  const res = await wrapFetch(`${BASE_URL}/denuncias/${id}/status?novoStatus=${novoStatus}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Falha ao atualizar status');
}

export async function confirmarAssuntoDenuncia(id, assuntoFinal) {
  const res = await wrapFetch(
    `${BASE_URL}/denuncias/${id}/assunto?assuntoFinal=${encodeURIComponent(assuntoFinal)}`,
    { method: 'PATCH' }
  );
  if (!res.ok) throw new Error('Falha ao confirmar assunto');
}

export function formatarData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes} ${hora}:${min}`;
}

export function statusEfetivo(d) {
  const precisaRevisao = Boolean(d.revisar || (d.assuntoIA && d.assuntoCid !== d.assuntoIA));
  const encaminhada = Boolean(d.orgao) || d.statusRaw === 'ENCAMINHADA';
  if (precisaRevisao && !encaminhada) return 'Pendente de revisão';
  if (encaminhada) return 'Encaminhada';
  if (d.assuntoIA) return 'Classificada';
  return 'Recebida';
}

export function encaminhadaEfetiva(d) {
  return Boolean(d.orgao) || d.statusRaw === 'ENCAMINHADA';
}

export function precisaRevisaoEfetiva(d) {
  const encaminhada = encaminhadaEfetiva(d);
  const precisaRevisao = Boolean(d.revisar || (d.assuntoIA && d.assuntoCid !== d.assuntoIA));
  return precisaRevisao && !encaminhada;
}

export function formatarHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${hora}:${min}`;
}

// Normaliza uma denúncia do M1 para o formato usado nas telas do M8.
// Aceita opcionalmente dados do M2 (classificação), M3 (priorização) e M5 (encaminhamento).
export function normalizarDenuncia(d, m2 = null, m3 = null, m5 = null) {
  const nivelParaLabel = { CRITICO: 'Crítico', ALTO: 'Alto', MEDIO: 'Médio', BAIXO: 'Baixo' };
  return {
    id: d.id,
    proto: d.protocolo,
    data: formatarData(d.recebidaEm),
    onde: d.onde || '—',
    texto: d.descricao,
    assuntoCid: d.assunto,
    assuntoIA: m2?.categoria_sugerida ?? m2?.categoria ?? (m2?.top3?.[0]?.categoria ?? null), // M2 top-1
    confianca: m2 ? Math.round((m2.confianca ?? 0) * 100) : null, // M2
    divergencia: m2?.divergencia ?? false,                         // M2
    revisar: m2?.revisar ?? false,                                 // M2
    area: m2?.area_responsavel ?? null,                            // M2
    criticidade: m3 ? (nivelParaLabel[m3.nivel] ?? m3.nivel) : null, // M3
    score: m3?.score ?? null,                                       // M3
    orgao: m5?.secretariaNome ?? null,                             // M5
    orgaoSigla: m5?.secretariaSigla ?? null,                       // M5
    orgaoId: m5?.secretariaId ?? null,                             // M5 — null = fallback hardcoded
    status: STATUS_LABEL[d.status] || d.status,
    statusRaw: d.status,
    manifestante: d.manifestante,
    historico: d.historico ?? [],
    recebidaEm: d.recebidaEm,
  };
}

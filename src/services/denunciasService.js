const BASE_URL = import.meta.env.VITE_M1_URL ?? 'http://localhost:8001';

export const STATUS_LABEL = {
  RECEBIDA: 'Recebida',
  CLASSIFICADA: 'Classificada',
  PRIORIZADA: 'Priorizada',
  PENDENTE_DE_REVISAO: 'Pendente de revisão',
  ENCAMINHADA: 'Encaminhada',
};

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
  const res = await fetch(`${BASE_URL}/denuncias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, 'Falha ao registrar denúncia');
}

export async function fetchDenuncias() {
  const res = await fetch(`${BASE_URL}/denuncias`);
  return handleResponse(res, 'Falha ao carregar denúncias');
}

export async function fetchDenunciaPorProtocolo(protocolo) {
  const res = await fetch(`${BASE_URL}/denuncias/protocolo/${encodeURIComponent(protocolo)}`);
  if (res.status === 404) return null;
  return handleResponse(res, 'Falha ao buscar denúncia');
}

export async function atualizarStatusDenuncia(id, novoStatus) {
  const res = await fetch(`${BASE_URL}/denuncias/${id}/status?novoStatus=${novoStatus}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Falha ao atualizar status');
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

// Normaliza uma denúncia do M1 para o formato usado nas telas do M8.
// Campos vindos de M2/M3/M5 ficam null — serão preenchidos quando esses
// módulos estiverem integrados.
export function normalizarDenuncia(d) {
  return {
    id: d.id,
    proto: d.protocolo,
    data: formatarData(d.recebidaEm),
    onde: d.onde || '—',
    texto: d.descricao,
    assuntoCid: d.assunto,
    assuntoIA: null,       // M2
    confianca: null,       // M2
    criticidade: null,     // M3
    orgao: null,           // M5
    status: STATUS_LABEL[d.status] || d.status,
    statusRaw: d.status,
    manifestante: d.manifestante,
    historico: d.historico ?? [],
    recebidaEm: d.recebidaEm,
  };
}

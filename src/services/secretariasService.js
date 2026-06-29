const BASE_URL = import.meta.env.VITE_M9_URL ?? 'http://localhost:8009';
const ERRO_CONEXAO = 'Não foi possível conectar ao serviço de Órgãos Públicos (M9). Verifique se ele está em execução.';

async function handleResponse(res, mensagemPadrao) {
  if (!res.ok) {
    let detalhe = mensagemPadrao;
    try {
      const corpo = await res.json();
      if (corpo?.detail) detalhe = corpo.detail;
    } catch (_) {}
    throw new Error(detalhe);
  }
  return res.json();
}

async function fetchComTratamento(url, opcoes, mensagemPadrao) {
  try {
    const res = await fetch(url, opcoes);
    return handleResponse(res, mensagemPadrao);
  } catch (e) {
    if (e instanceof TypeError) throw new Error(ERRO_CONEXAO);
    throw e;
  }
}

export async function fetchSecretarias() {
  return fetchComTratamento(`${BASE_URL}/secretarias/`, undefined, 'Falha ao carregar secretarias');
}

export async function createSecretaria(payload) {
  return fetchComTratamento(`${BASE_URL}/secretarias/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Falha ao criar secretaria');
}

export async function updateSecretaria(id, payload) {
  return fetchComTratamento(`${BASE_URL}/secretarias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Falha ao atualizar secretaria');
}

export async function toggleSecretaria(id, ativo) {
  return updateSecretaria(id, { ativo });
}

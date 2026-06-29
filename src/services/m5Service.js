const BASE_URL = import.meta.env.VITE_M5_URL ?? 'http://localhost:8005';

async function wrapFetch(url, opcoes) {
  try {
    return await fetch(url, opcoes);
  } catch (e) {
    if (e instanceof TypeError)
      throw new Error('Não foi possível conectar ao serviço de Roteamento (M5). Verifique se ele está em execução.');
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

export async function fetchEncaminhamentos() {
  const res = await wrapFetch(`${BASE_URL}/encaminhamentos`);
  return handleResponse(res, 'Falha ao carregar encaminhamentos M5');
}

export async function fetchEncaminhamentoPorDenuncia(id) {
  if (!id) return null;
  const res = await wrapFetch(`${BASE_URL}/encaminhamentos/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  return handleResponse(res, 'Falha ao buscar encaminhamento M5');
}

export async function fetchEncaminhamentosPorNivel(nivel) {
  const res = await wrapFetch(`${BASE_URL}/encaminhamentos/nivel/${encodeURIComponent(nivel)}`);
  return handleResponse(res, 'Falha ao buscar encaminhamentos por nível');
}

export async function redirecionarEncaminhamento(id, secretariaId) {
  const res = await wrapFetch(
    `${BASE_URL}/encaminhamentos/${encodeURIComponent(id)}/redirecionar`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secretariaId }),
    }
  );
  return handleResponse(res, 'Falha ao redirecionar encaminhamento');
}

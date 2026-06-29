const BASE_URL = import.meta.env.VITE_M3_URL ?? 'http://localhost:8003';

async function wrapFetch(url, opcoes) {
  try {
    return await fetch(url, opcoes);
  } catch (e) {
    if (e instanceof TypeError)
      throw new Error('Não foi possível conectar ao serviço de Priorização (M3). Verifique se ele está em execução.');
    throw e;
  }
}

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

export async function fetchM3Stats() {
  const res = await wrapFetch(`${BASE_URL}/stats`);
  return handleResponse(res, 'Falha ao carregar estatísticas M3');
}

export async function fetchM3Denuncia(id) {
  if (!id) return null;
  const res = await wrapFetch(`${BASE_URL}/denuncias/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  return handleResponse(res, 'Falha ao buscar priorização M3');
}

export async function fetchM3Denuncias(limite = 200, nivel = null) {
  const params = new URLSearchParams({ limite });
  if (nivel) params.set('nivel', nivel);
  const res = await wrapFetch(`${BASE_URL}/denuncias?${params}`);
  return handleResponse(res, 'Falha ao carregar priorizações M3');
}

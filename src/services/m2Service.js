const BASE_URL = import.meta.env.VITE_M2_URL ?? 'http://localhost:8002';

async function wrapFetch(url, opcoes) {
  try {
    return await fetch(url, opcoes);
  } catch (e) {
    if (e instanceof TypeError)
      throw new Error('Não foi possível conectar ao serviço de Classificação (M2). Verifique se ele está em execução.');
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

export async function fetchM2Stats() {
  const res = await wrapFetch(`${BASE_URL}/stats`);
  return handleResponse(res, 'Falha ao carregar estatísticas M2');
}

export async function fetchM2Denuncia(id) {
  if (!id) return null;
  const res = await wrapFetch(`${BASE_URL}/denuncias/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  return handleResponse(res, 'Falha ao buscar classificação M2');
}

export async function fetchM2Denuncias(limite = 200) {
  const res = await wrapFetch(`${BASE_URL}/denuncias?limite=${limite}`);
  return handleResponse(res, 'Falha ao carregar classificações M2');
}

export async function fetchM2PorTexto(texto) {
  if (!texto) return null;
  try {
    const res = await fetch(`${BASE_URL}/denuncias?texto=${encodeURIComponent(texto)}&limite=1`);
    if (!res.ok) return null;
    const lista = await res.json();
    return lista[0] ?? null;
  } catch (e) {
    return null;
  }
}

export async function classificarTexto(texto) {
  const res = await wrapFetch(`${BASE_URL}/classificar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto }),
  });
  return handleResponse(res, 'Falha ao classificar texto');
}

export async function revisarClassificacao(id, categoriaFinal) {
  const res = await wrapFetch(`${BASE_URL}/denuncias/${encodeURIComponent(id)}/revisar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoria_final: categoriaFinal }),
  });
  return handleResponse(res, 'Falha ao revisar classificação');
}

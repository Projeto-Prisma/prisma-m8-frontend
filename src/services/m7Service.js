const BASE_URL = import.meta.env.VITE_API_ANALYTICS ?? 'http://localhost:8007';

async function wrapFetch(url, opcoes) {
  try {
    return await fetch(url, opcoes);
  } catch (e) {
    if (e instanceof TypeError)
      throw new Error('Não foi possível conectar ao serviço de Analytics (M7). Verifique se ele está em execução.');
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

export async function fetchAnalyticsResumo() {
  const res = await wrapFetch(`${BASE_URL}/estatisticas`);
  return handleResponse(res, 'Falha ao carregar resumo M7');
}

export async function fetchAnalyticsPorCategoria() {
  const res = await wrapFetch(`${BASE_URL}/estatisticas/por-categoria`);
  return handleResponse(res, 'Falha ao carregar estatísticas por categoria');
}

export async function fetchAnalyticsPorNivel() {
  const res = await wrapFetch(`${BASE_URL}/estatisticas/por-nivel`);
  return handleResponse(res, 'Falha ao carregar estatísticas por nível');
}

export async function fetchAnalyticsPorArea() {
  const res = await wrapFetch(`${BASE_URL}/estatisticas/por-area`);
  return handleResponse(res, 'Falha ao carregar estatísticas por área');
}

export async function fetchAnalyticsPorSecretaria() {
  const res = await wrapFetch(`${BASE_URL}/estatisticas/por-secretaria`);
  return handleResponse(res, 'Falha ao carregar estatísticas por secretaria');
}

export async function fetchVolumeDiario(janelaDias = 30) {
  const res = await wrapFetch(`${BASE_URL}/estatisticas/volume-diario?janela_dias=${janelaDias}`);
  return handleResponse(res, 'Falha ao carregar volume diário');
}

export async function fetchTempoResposta() {
  const res = await wrapFetch(`${BASE_URL}/tempo-resposta`);
  return handleResponse(res, 'Falha ao carregar tempo de resposta');
}

export async function fetchRecorrencias({ janela, minContagem = 2, limite = 100 } = {}) {
  const params = new URLSearchParams({ min_contagem: minContagem, limite });
  if (janela) params.set('janela', janela);
  const res = await wrapFetch(`${BASE_URL}/recorrencias?${params}`);
  return handleResponse(res, 'Falha ao carregar recorrências M7');
}

export async function fetchMapaCalor({ janelaDias = 30, limite = 500 } = {}) {
  const res = await wrapFetch(`${BASE_URL}/mapa-calor?janela_dias=${janelaDias}&limite=${limite}`);
  return handleResponse(res, 'Falha ao carregar mapa de calor M7');
}

export function formatarTempoResposta(stats) {
  if (!stats?.media_s) return '—';
  const s = stats.media_s;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  if (s < 86400) return `${Math.round(s / 3600)} h`;
  return `${Math.round(s / 86400)} dias`;
}

export function derivarCriticidade(contagem) {
  if (contagem >= 10) return 'Crítico';
  if (contagem >= 5) return 'Alto';
  if (contagem >= 2) return 'Médio';
  return 'Baixo';
}

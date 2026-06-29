const BASE_URL = import.meta.env.VITE_M6_URL ?? 'http://localhost:8006';

async function wrapFetch(url, opcoes) {
  try {
    return await fetch(url, opcoes);
  } catch (e) {
    if (e instanceof TypeError)
      throw new Error('Não foi possível conectar ao serviço de Notificações (M6). Verifique se ele está em execução.');
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

const M6_TIPO_PARA_UI = {
  CIDADAO_ENCAMINHADA: 'enc',
  SECRETARIA_ALERTA_CRITICO: 'crit',
  SECRETARIA_ALERTA_ALTO: 'rec',
};

export function mapM6TipoParaUI(tipo) {
  if (M6_TIPO_PARA_UI[tipo]) return M6_TIPO_PARA_UI[tipo];
  if (tipo?.includes('ALERTA')) return 'rec';
  return 'sys';
}

export function tempoRelativo(isoStr) {
  if (!isoStr) return '—';
  const diff = Date.now() - new Date(isoStr).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} hora${h !== 1 ? 's' : ''}`;
  const d = Math.round(h / 24);
  if (d === 1) return 'ontem';
  return `há ${d} dias`;
}

export function normalizarNotificacao(n) {
  return {
    tipo: mapM6TipoParaUI(n.tipo),
    texto: (() => { try { return JSON.parse(n.conteudo)?.mensagem ?? n.conteudo; } catch { return n.conteudo; } })(),
    quando: tempoRelativo(n.criado_em),
    lida: n.lida ?? false,
    proto: n.denuncia_id ?? null,
    _id: n.id,
  };
}

export async function marcarNotificacaoLida(id) {
  const res = await wrapFetch(`${BASE_URL}/notificacoes/${id}/lida`, { method: 'PATCH' });
  return handleResponse(res, 'Falha ao marcar notificação como lida');
}

export async function marcarTodasNotificacoesLidas() {
  const res = await wrapFetch(`${BASE_URL}/notificacoes/marcar-todas-lidas`, { method: 'PATCH' });
  return handleResponse(res, 'Falha ao marcar todas notificações como lidas');
}

export async function fetchNotificacoes(limite = 50, tipo = null, denunciaId = null) {
  const params = new URLSearchParams({ limite });
  if (tipo) params.set('tipo', tipo);
  if (denunciaId) params.set('denuncia_id', denunciaId);
  const res = await wrapFetch(`${BASE_URL}/notificacoes?${params}`);
  return handleResponse(res, 'Falha ao carregar notificações M6');
}

export async function fetchNotificacoesDenuncia(denunciaId) {
  if (!denunciaId) return [];
  const res = await wrapFetch(`${BASE_URL}/notificacoes/${encodeURIComponent(denunciaId)}`);
  return handleResponse(res, 'Falha ao carregar notificações da denúncia');
}

export async function fetchAlertas(limite = 50) {
  const res = await wrapFetch(`${BASE_URL}/alertas?limite=${limite}`);
  return handleResponse(res, 'Falha ao carregar alertas M6');
}

export async function fetchEstatisticasM6() {
  const res = await wrapFetch(`${BASE_URL}/estatisticas`);
  return handleResponse(res, 'Falha ao carregar estatísticas M6');
}

const BASE_URL = import.meta.env.VITE_M4_URL ?? 'http://localhost:8004';

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

export async function fetchM4Padroes(janela = 30, minContagem = 2) {
  const res = await fetch(`${BASE_URL}/padroes?janela=${janela}&min_contagem=${minContagem}`);
  return handleResponse(res, 'Falha ao carregar padrões M4');
}

export async function fetchM4Mapa(janela = 30, minContagem = 2) {
  const res = await fetch(`${BASE_URL}/mapa?janela=${janela}&min_contagem=${minContagem}`);
  return handleResponse(res, 'Falha ao carregar mapa M4');
}

export async function fetchM4Ocorrencias(limite = 100, bairro = null) {
  const params = new URLSearchParams({ limite });
  if (bairro) params.set('bairro', bairro);
  const res = await fetch(`${BASE_URL}/ocorrencias?${params}`);
  return handleResponse(res, 'Falha ao carregar ocorrências M4');
}

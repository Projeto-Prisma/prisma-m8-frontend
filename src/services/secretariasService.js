const BASE_URL = import.meta.env.VITE_M9_URL ?? 'http://localhost:8009';

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

export async function fetchSecretarias() {
  const res = await fetch(`${BASE_URL}/secretarias/`);
  return handleResponse(res, 'Falha ao carregar secretarias');
}

export async function createSecretaria(payload) {
  const res = await fetch(`${BASE_URL}/secretarias/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, 'Falha ao criar secretaria');
}

export async function updateSecretaria(id, payload) {
  const res = await fetch(`${BASE_URL}/secretarias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, 'Falha ao atualizar secretaria');
}

export async function toggleSecretaria(id, ativo) {
  return updateSecretaria(id, { ativo });
}

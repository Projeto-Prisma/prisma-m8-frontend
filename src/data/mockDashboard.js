// Dados do painel inicial (dashboard) e da criticidade por bairro.

export const kpis = [
  { id: 'hoje', label: 'Denúncias hoje', valor: '128', nota: '52 encaminhadas hoje', tom: 'brand' },
  { id: 'pendentes', label: 'Pendentes de revisão', valor: '17', nota: 'aguardando triagem humana', tom: 'ia' },
  { id: 'acumulado', label: 'Total no mês', valor: '342', nota: '+8% vs. mês anterior', tom: 'neutro' },
  { id: 'tempo', label: 'Tempo médio de resposta', valor: '3 dias', nota: 'do registro ao encaminhamento', tom: 'ok' },
];

// Estatísticas públicas (vitrine da ouvidoria).
export const estatisticasPublicas = [
  { valor: '21 mil+', label: 'manifestações tratadas' },
  { valor: '56', label: 'órgãos integrados' },
  { valor: '3 dias', label: 'tempo médio de resposta' },
];

// Alertas de recorrência — bairros com o mesmo problema se repetindo.
export const recorrencias = [
  { bairro: 'Ibura', categoria: 'Buraco / Pavimentação', count: 15, periodo: '30 dias', criticidade: 'Crítico' },
  { bairro: 'Boa Viagem', categoria: 'Iluminação Pública', count: 8, periodo: '30 dias', criticidade: 'Alto' },
  { bairro: 'Afogados', categoria: 'Limpeza Urbana', count: 6, periodo: '30 dias', criticidade: 'Médio' },
];

// Zonas para o mapa de criticidade. As posições (x,y em %) são aproximadas
// e servem só para o mapa estilizado — não são coordenadas reais.
export const zonasMapa = [
  { bairro: 'Ibura', criticidade: 'Crítico', count: 15, x: 64, y: 82 },
  { bairro: 'Afogados', criticidade: 'Alto', count: 11, x: 40, y: 64 },
  { bairro: 'Boa Viagem', criticidade: 'Alto', count: 9, x: 70, y: 70 },
  { bairro: 'Várzea', criticidade: 'Alto', count: 8, x: 16, y: 40 },
  { bairro: 'Casa Amarela', criticidade: 'Médio', count: 7, x: 44, y: 24 },
  { bairro: 'Encruzilhada', criticidade: 'Médio', count: 5, x: 52, y: 44 },
  { bairro: 'Boa Vista', criticidade: 'Médio', count: 5, x: 46, y: 50 },
  { bairro: 'Pina', criticidade: 'Baixo', count: 3, x: 74, y: 58 },
  { bairro: 'Espinheiro', criticidade: 'Baixo', count: 2, x: 56, y: 38 },
];

// Sistema de criticidade usado em todo o painel.
// Cada nível tem cor de destaque, cor de fundo e um "slug" para classes CSS.

export const NIVEIS_CRITICIDADE = ['Crítico', 'Alto', 'Médio', 'Baixo'];

const META = {
  Crítico: { slug: 'critico', color: 'var(--crit-critico)', bg: 'var(--crit-critico-bg)' },
  Alto: { slug: 'alto', color: 'var(--crit-alto)', bg: 'var(--crit-alto-bg)' },
  Médio: { slug: 'medio', color: 'var(--crit-medio)', bg: 'var(--crit-medio-bg)' },
  Baixo: { slug: 'baixo', color: 'var(--crit-baixo)', bg: 'var(--crit-baixo-bg)' },
};

export function critMeta(nivel) {
  return META[nivel] || META['Baixo'];
}

// Peso para ordenar do mais grave ao menos grave.
export const PESO_CRITICIDADE = { Crítico: 4, Alto: 3, Médio: 2, Baixo: 1 };

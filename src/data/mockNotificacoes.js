// Central de notificações do painel.
// Tipos: pend (pendência de revisão), crit (denúncia crítica),
// rec (alerta de recorrência), enc (encaminhamento), sys (sistema).

export const TIPOS_NOTIFICACAO = {
  pend: { rotulo: 'Pendência', cor: 'var(--ia)', bg: 'var(--ia-bg)' },
  crit: { rotulo: 'Crítica', cor: 'var(--crit-critico)', bg: 'var(--crit-critico-bg)' },
  rec: { rotulo: 'Recorrência', cor: 'var(--crit-alto)', bg: 'var(--crit-alto-bg)' },
  enc: { rotulo: 'Encaminhada', cor: 'var(--ok)', bg: 'var(--ok-bg)' },
  sys: { rotulo: 'Sistema', cor: 'var(--muted)', bg: 'var(--line-soft)' },
};

export const notificacoes = [
  {
    tipo: 'pend',
    texto:
      'Nova pendência: protocolo 2025-074851 — assunto divergente (Iluminação Pública → Riscos à Infraestrutura). Confiança: 55%.',
    quando: 'há 5 min',
    lida: false,
    proto: '2025-074851',
  },
  {
    tipo: 'crit',
    texto:
      'Denúncia crítica recebida: poste caído com faíscas na Rua das Mangueiras, Ibura.',
    quando: 'há 12 min',
    lida: false,
    proto: '2025-074851',
  },
  {
    tipo: 'rec',
    texto:
      'Alerta de recorrência: 15 denúncias de Buraco / Pavimentação em Ibura nos últimos 30 dias. Zona sinalizada no mapa.',
    quando: 'há 28 min',
    lida: false,
  },
  {
    tipo: 'pend',
    texto:
      'Nova pendência: protocolo 2025-074847 — divergência entre Poluição Sonora e Fiscalização.',
    quando: 'há 47 min',
    lida: false,
    proto: '2025-074847',
  },
  {
    tipo: 'enc',
    texto:
      'Denúncia 2025-074844 encaminhada à Emlurb com sucesso. Órgão notificado por e-mail.',
    quando: 'há 1 hora',
    lida: false,
    proto: '2025-074844',
  },
  {
    tipo: 'rec',
    texto:
      'Alerta de recorrência: 8 denúncias de Iluminação Pública em Boa Viagem nos últimos 30 dias.',
    quando: 'há 2 horas',
    lida: true,
  },
  {
    tipo: 'pend',
    texto:
      'Nova pendência: protocolo 2025-074839 — assunto divergente (Iluminação Pública → Buraco / Pavimentação). Confiança: 62%.',
    quando: 'há 3 horas',
    lida: true,
    proto: '2025-074839',
  },
  {
    tipo: 'sys',
    texto:
      'Órgão CTTU atualizado: 2 novas categorias adicionadas (Ciclofaixa, Estacionamento).',
    quando: 'há 5 horas',
    lida: true,
  },
  {
    tipo: 'enc',
    texto: 'Denúncia 2025-074840 encaminhada à CTTU. Criticidade: Médio.',
    quando: 'ontem 17:34',
    lida: true,
    proto: '2025-074840',
  },
  {
    tipo: 'sys',
    texto: 'Sistema: rotina de reclassificação concluída. 1.204 denúncias reavaliadas pela IA.',
    quando: 'ontem 03:00',
    lida: true,
  },
];

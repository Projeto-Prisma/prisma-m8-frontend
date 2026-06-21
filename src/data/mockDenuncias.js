// Denúncias mockadas da Ouvidoria.
//
// Cada denúncia traz o assunto informado pelo cidadão (assuntoCid) e o assunto
// classificado automaticamente pela IA (assuntoIA). Quando os dois divergem, a
// denúncia entra em "Pendente de revisão" — é o elo com o classificador de texto.

export const mockDenuncias = [
  {
    proto: '2025-074839',
    data: '15/10 09:32',
    bairro: 'Várzea',
    criticidade: 'Alto',
    texto:
      'Tem um buraco enorme na Av. Caxangá, perto do posto de gasolina, que já causou dois acidentes de moto esta semana. A calçada também está completamente destruída.',
    assuntoCid: 'Iluminação Pública',
    assuntoIA: 'Buraco / Pavimentação',
    confianca: 62,
    orgao: 'Emlurb',
    status: 'Pendente de revisão',
  },
  {
    proto: '2025-074841',
    data: '15/10 08:47',
    bairro: 'Casa Amarela',
    criticidade: 'Baixo',
    texto:
      'Encontrei um entulho enorme na calçada da Estrada do Arraial bloqueando completamente a passagem de pedestres e impedindo cadeirantes.',
    assuntoCid: 'Limpeza Urbana',
    assuntoIA: 'Construção Irregular',
    confianca: 58,
    orgao: 'Sec. Ordem Pública',
    status: 'Pendente de revisão',
  },
  {
    proto: '2025-074843',
    data: '14/10 16:22',
    bairro: 'Afogados',
    criticidade: 'Alto',
    texto:
      'Há um esgoto a céu aberto na Estrada do Arraial próximo à escola, causando mau cheiro e risco à saúde das crianças que passam por ali diariamente.',
    assuntoCid: 'Saúde Pública',
    assuntoIA: 'Saneamento',
    confianca: 64,
    orgao: 'Sec. Saúde',
    status: 'Pendente de revisão',
  },
  {
    proto: '2025-074847',
    data: '13/10 23:45',
    bairro: 'Boa Viagem',
    criticidade: 'Médio',
    texto:
      'Barulho excessivo de obra acontecendo de madrugada na Av. Boa Viagem, perturbando o descanso dos moradores do condomínio vizinho.',
    assuntoCid: 'Poluição Sonora',
    assuntoIA: 'Fiscalização',
    confianca: 61,
    orgao: 'Sec. Ordem Pública',
    status: 'Pendente de revisão',
  },
  {
    proto: '2025-074851',
    data: '13/10 11:08',
    bairro: 'Ibura',
    criticidade: 'Crítico',
    texto:
      'Poste elétrico inclinado perigosamente na Rua das Mangueiras próximo à praça. Risco de queda a qualquer momento. Já houve faíscas visíveis.',
    assuntoCid: 'Iluminação Pública',
    assuntoIA: 'Riscos à Infraestrutura',
    confianca: 55,
    orgao: 'Emlurb',
    status: 'Pendente de revisão',
  },
  {
    proto: '2025-074844',
    data: '14/10 14:10',
    bairro: 'Boa Vista',
    criticidade: 'Médio',
    texto:
      'Lixo acumulado há mais de uma semana na esquina da Rua do Hospício. O caminhão de coleta não passou nas últimas duas semanas.',
    assuntoCid: 'Limpeza Urbana',
    assuntoIA: 'Limpeza Urbana',
    confianca: 91,
    orgao: 'Emlurb',
    status: 'Encaminhada',
  },
  {
    proto: '2025-074840',
    data: '14/10 11:55',
    bairro: 'Encruzilhada',
    criticidade: 'Médio',
    texto:
      'Semáforo quebrado no cruzamento da Av. Agamenon Magalhães. Está piscando amarelo desde ontem e o trânsito ficou perigoso.',
    assuntoCid: 'Sinalização / Trânsito',
    assuntoIA: 'Sinalização / Trânsito',
    confianca: 88,
    orgao: 'CTTU',
    status: 'Encaminhada',
  },
  {
    proto: '2025-074838',
    data: '13/10 09:20',
    bairro: 'Pina',
    criticidade: 'Baixo',
    texto:
      'A lâmpada do poste em frente à praça do Pina está queimada há quase um mês. À noite a área fica completamente escura.',
    assuntoCid: 'Iluminação Pública',
    assuntoIA: 'Iluminação Pública',
    confianca: 94,
    orgao: 'Emlurb',
    status: 'Encaminhada',
  },
];

// Saber se a denúncia tem divergência entre cidadão e IA.
export function temDivergencia(d) {
  return d.assuntoCid !== d.assuntoIA;
}

// Localizar por protocolo (usado na tela de detalhe).
export function getDenuncia(proto) {
  return mockDenuncias.find((d) => d.proto === proto);
}

// Feed "ao vivo" do dashboard — denúncias chegando hoje (formato enxuto).
export const feedDenunciasHoje = [
  { texto: 'Buraco enorme na Av. Caxangá próximo ao posto', bairro: 'Várzea', hora: '09:32', criticidade: 'Alto' },
  { texto: 'Lâmpada apagada há 3 semanas na Rua da Aurora', bairro: 'Boa Viagem', hora: '09:18', criticidade: 'Médio' },
  { texto: 'Alagamento recorrente perto da escola estadual', bairro: 'Afogados', hora: '09:01', criticidade: 'Crítico' },
  { texto: 'Entulho depositado no meio da calçada há dias', bairro: 'Ibura', hora: '08:47', criticidade: 'Baixo' },
  { texto: 'Semáforo quebrado no cruzamento da Av. Agamenon', bairro: 'Encruzilhada', hora: '08:33', criticidade: 'Alto' },
  { texto: 'Esgoto a céu aberto na Estrada do Arraial', bairro: 'Casa Amarela', hora: '08:15', criticidade: 'Alto' },
];

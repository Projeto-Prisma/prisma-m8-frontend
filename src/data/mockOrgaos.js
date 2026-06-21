// Órgãos públicos integrados à ouvidoria.

// Ranking de encaminhamentos (quem mais recebe denúncias).
export const rankingOrgaos = [
  { rank: '1°', nome: 'Emlurb', pct: 100, count: 412 },
  { rank: '2°', nome: 'CTTU', pct: 48, count: 198 },
  { rank: '3°', nome: 'Sec. Saúde', pct: 38, count: 156 },
  { rank: '4°', nome: 'Sec. Ordem Pública', pct: 32, count: 134 },
  { rank: '5°', nome: 'Sec. Educação', pct: 19, count: 78 },
];

// Cadastro de órgãos — categorias atendidas, contato e se está ativo no roteamento.
export const orgaos = [
  {
    nome: 'Emlurb',
    descricao: 'Empresa de Manutenção e Limpeza Urbana',
    categorias: ['Limpeza Urbana', 'Buraco / Pavimentação', 'Iluminação Pública'],
    email: 'emlurb@recife.pe.gov.br',
    count: 412,
    ativo: true,
  },
  {
    nome: 'CTTU',
    descricao: 'Companhia de Trânsito e Transporte Urbano',
    categorias: ['Sinalização / Trânsito', 'Ciclofaixa', 'Estacionamento'],
    email: 'cttu@recife.pe.gov.br',
    count: 198,
    ativo: true,
  },
  {
    nome: 'Sec. Saúde',
    descricao: 'Secretaria de Saúde',
    categorias: ['Saúde Pública', 'Saneamento'],
    email: 'saude@recife.pe.gov.br',
    count: 156,
    ativo: true,
  },
  {
    nome: 'Sec. Ordem Pública',
    descricao: 'Secretaria de Ordem Pública',
    categorias: ['Fiscalização', 'Poluição Sonora', 'Construção Irregular'],
    email: 'ordempublica@recife.pe.gov.br',
    count: 134,
    ativo: true,
  },
  {
    nome: 'Sec. Educação',
    descricao: 'Secretaria de Educação',
    categorias: ['Escolas', 'Merenda'],
    email: 'educacao@recife.pe.gov.br',
    count: 78,
    ativo: true,
  },
  {
    nome: 'Sec. Meio Ambiente',
    descricao: 'Secretaria de Meio Ambiente e Sustentabilidade',
    categorias: ['Riscos à Infraestrutura', 'Arborização'],
    email: 'meioambiente@recife.pe.gov.br',
    count: 0,
    ativo: false,
  },
];

// Dados de apoio para o portal público (Conecta Recife).
//
// O acompanhamento de protocolo reaproveita as MESMAS denúncias mockadas do
// painel (src/data/mockDenuncias.js): o cidadão consulta pelo protocolo e vê a
// linha do tempo derivada do status da denúncia.

import { temDivergencia } from './mockDenuncias';

// Assuntos oferecidos no formulário (o cidadão escolhe o mais próximo e a IA
// confirma/ajusta depois).
export const ASSUNTOS = [
  // Meio Ambiente e Sustentabilidade
  'Crime Ambiental',
  'Poluição',
  'Poluição Sonora',
  'Vigilância Ambiental',
  // Limpeza e Conservação Urbana
  'Coleta de Lixo',
  'Descarte Irregular de Lixo',
  'Manutenção e Limpeza Urbana',
  // Saúde
  'Agente de Saúde',
  'Conduta Médica',
  'Saúde Recife',
  'Unidades de Saúde',
  'Vigilância Sanitária',
  // Educação e Esporte Comunitário
  'Academia  Recife',
  'Academia da Cidade',
  'Creche',
  'Professor',
  // Proteção e Direitos Humanos
  'Acessibilidade',
  'Agressão',
  'Assédio',
  'Casa de Apoio',
  'Conselho Tutelar',
  'Criança e Adolescente',
  'População em Situação de Rua',
  'Violação de Direitos',
  'Violação do Direito do Idoso',
  'Violência contra a Pessoa Idosa',
  'Violência contra a Pessoa com Deficiência',
  // Fiscalização e Ordem Pública
  'Comercio Informal',
  'Construção Irregular',
  'Fiscalização',
  'Imóvel abandonado',
  'Invasão',
  'Vistoria',
  // Mobilidade e Trânsito
  'Estacionamento',
  'Linha Complementar',
  'Reboque',
  'Táxi',
  // Defesa Animal
  'Direitos Animais',
  // Integridade e Conduta Pública
  'Abuso de Autoridade',
  'Acumulação Indevida de Cargos Públicos',
  'Assédio Moral',
  'Ato lesivo contra a Administração Pública',
  'Conduta Antiética',
  'Conduta Inapropriada',
  'Corrupção',
  'Gestão',
  'Irregularidade Administrativa',
  'Irregularidade administrativa',
  'Irregularidades Administrativas',
  'Pagamento',
  'Prevaricação',
  'Processo',
  'Servidor',
  'Sonegação',
  // Defesa do Consumidor
  'Proteção e Defesa do Consumidor',
  // Encaminhamento Externo
  'Compesa',
  'Ministério do Trabalho e Emprego',
  'SDS',
  'SES',
];

export const PROFISSOES = ['Estudante', 'Autônomo(a)', 'Servidor(a) público(a)', 'Empregado(a)', 'Aposentado(a)', 'Outra'];
export const TIPOS_DOC = ['CPF', 'RG', 'CNH', 'Passaporte'];
export const SEXOS = ['Feminino', 'Masculino', 'Prefiro não informar'];
export const GENEROS = ['Mulher cis', 'Homem cis', 'Mulher trans', 'Homem trans', 'Não-binário', 'Prefiro não informar'];
export const ONDES = [
  'Afogados',
  'Água Fria',
  'Alto José Bonifácio',
  'Alto José do Pinho',
  'Alto do Mandu',
  'Areias',
  'Arruda',
  'Beberibe',
  'Boa Viagem',
  'Boa Vista',
  'Bomba do Hemetério',
  'Brejo da Guabiraba',
  'Brejo de Beberibe',
  'Cajueiro',
  'Campina do Barreto',
  'Campo Grande',
  'Caxangá',
  'Cidade Universitária',
  'Coelhos',
  'Cohab',
  'Cordeiro',
  'Córrego do Jenipapo',
  'Derby',
  'Dois Irmãos',
  'Doze de Outubro',
  'Encruzilhada',
  'Engenho do Meio',
  'Espinheiro',
  'Fundão',
  'Graças',
  'Gracuí',
  'Guabiraba',
  'Hipódromo',
  'Ibura',
  'Ilha do Leite',
  'Ilha do Retiro',
  'Ilha Joana Bezerra',
  'Imbiribeira',
  'Ipsep',
  'Jaqueira',
  'Jardim São Paulo',
  'Joana Bezerra',
  'Jordão',
  'Linha do Tiro',
  'Macaxeira',
  'Mangabeira',
  'Mangueira',
  'Monteiro',
  'Morro da Conceição',
  'Mustardinha',
  'Nova Descoberta',
  'Novo Chester',
  'Paissandu',
  'Parnamirim',
  'Peixinhos',
  'Pina',
  'Ponto de Parada',
  'Poço',
  'Prado',
  'Recife',
  'Rosarinho',
  'Sancho',
  'Santa Terezinha',
  'Santana',
  'Santo Amaro',
  'São José',
  'Setúbal',
  'Sítio dos Pintos',
  'Soledade',
  'Tejipió',
  'Torreão',
  'Torre',
  'Torrões',
  'Totó',
  'Três Carneiros',
  'Várzea',
  'Vasco da Gama',
  'Vista Alegre',
  'Zumbi',
];

// Monta a linha do tempo pública a partir de uma denúncia do mock.
// Cada etapa: { title, detail, time, done, current }.
export function timelineFromDenuncia(d) {
  if (!d) return [];

  const divergente = temDivergencia(d);
  const encaminhada = d.status === 'Encaminhada';
  const dataBase = `${d.data.split(' ')[0]}/2025`;

  const etapas = [
    {
      title: 'Recebida',
      detail: 'Denúncia registrada no sistema',
      time: `${dataBase} ${d.data.split(' ')[1] || ''}`.trim(),
      done: true,
    },
    {
      title: `Classificada pela IA (${d.confianca}%)`,
      detail: `${d.assuntoIA} ${divergente ? '— divergência com o informado' : 'confirmado'}`,
      time: dataBase,
      done: true,
    },
    {
      title: `Priorizada: ${d.criticidade}`,
      detail: 'Score de criticidade calculado',
      time: dataBase,
      done: true,
    },
  ];

  if (encaminhada) {
    etapas.push({
      title: `Encaminhada → ${d.orgao}`,
      detail: 'Órgão responsável notificado',
      time: dataBase,
      done: true,
    });
    etapas.push({
      title: 'Aguardando resolução…',
      detail: 'Em atendimento pela equipe',
      time: '',
      done: false,
    });
  } else {
    etapas.push({
      title: 'Pendente de revisão',
      detail: 'Aguardando confirmação humana do assunto antes do encaminhamento',
      time: `desde ${dataBase}`,
      done: false,
      current: true,
    });
    etapas.push({
      title: 'Encaminhamento ao órgão',
      detail: '—',
      time: '',
      done: false,
    });
  }

  return etapas;
}

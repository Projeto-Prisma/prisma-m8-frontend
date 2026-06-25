// Dados de apoio para o portal público (Conecta Recife).
//
// O acompanhamento de protocolo reaproveita as MESMAS denúncias mockadas do
// painel (src/data/mockDenuncias.js): o cidadão consulta pelo protocolo e vê a
// linha do tempo derivada do status da denúncia.

import { temDivergencia } from './mockDenuncias';

// Assuntos oferecidos no formulário (o cidadão escolhe o mais próximo e a IA
// confirma/ajusta depois).
export const ASSUNTOS = [
  'Buraco / Pavimentação',
  'Iluminação Pública',
  'Limpeza Urbana',
  'Saneamento',
  'Sinalização / Trânsito',
  'Poluição Sonora',
  'Construção Irregular',
  'Riscos à Infraestrutura',
  'Fiscalização',
  'Saúde Pública',
];

export const PROFISSOES = ['Estudante', 'Autônomo(a)', 'Servidor(a) público(a)', 'Empregado(a)', 'Aposentado(a)', 'Outra'];
export const TIPOS_DOC = ['CPF', 'RG', 'CNH', 'Passaporte'];
export const SEXOS = ['Feminino', 'Masculino', 'Prefiro não informar'];
export const GENEROS = ['Mulher cis', 'Homem cis', 'Mulher trans', 'Homem trans', 'Não-binário', 'Prefiro não informar'];
export const ONDES = ['Recife', 'Olinda', 'Jaboatão dos Guararapes', 'Outro município'];

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

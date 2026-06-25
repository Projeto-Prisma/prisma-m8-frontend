# Prisma — Painel da Ouvidoria

Painel administrativo da Ouvidoria de Recife para **triagem inteligente de denúncias urbanas**.


## Como rodar

```bash
npm install
npm run dev      # ambiente de desenvolvimento (http://localhost:5173)
```

Outros scripts:

```bash
npm run build    # build de produção em dist/
npm run preview  # serve o build de produção
npm run lint     # ESLint
```

> Requer Node.js 18+.

## Telas

O sistema tem duas faces que compartilham a mesma identidade visual: o **portal
público** do cidadão (sem login) e o **painel da gestão** (área restrita).

### Portal público (cidadão)

| Rota           | Tela                | O que mostra |
|----------------|---------------------|--------------|
| `/portal`      | Home                | Página inicial: hero, "como funciona" (registro → IA → órgão), números e chamadas para ação |
| `/denunciar`   | Fazer denúncia      | Formulário em 4 passos (dados → anexo/localização → revisão → protocolo) com validação e contador de caracteres |
| `/acompanhar`  | Acompanhar denúncia | Consulta por número de protocolo, com linha do tempo da triagem (lê as mesmas denúncias do painel) |

> O portal é navegável sem autenticação. O botão **"Área restrita"** leva ao
> login da gestão; o login tem o atalho **"Voltar ao portal público"**.

### Painel da gestão (área restrita)

| Rota             | Tela              | O que mostra |
|------------------|-------------------|--------------|
| `/`              | Dashboard         | KPIs do dia, feed "chegando hoje", pendências de revisão e alertas de recorrência |
| `/mapa`          | Mapa              | Mapa esquemático de criticidade por bairro (bolhas dimensionadas por volume) |
| `/denuncias`     | Denúncias         | Lista com filtros (todas / pendentes / encaminhadas), busca e divergência cidadão↔IA |
| `/denuncias/:proto` | Detalhe        | Texto da manifestação, veredito da IA, linha do tempo da triagem e encaminhamento |
| `/orgaos`        | Órgãos Públicos   | Ranking de encaminhamentos e cadastro de órgãos com categorias e ativação |
| `/notificacoes`  | Notificações      | Feed por tipo (pendência, crítica, recorrência, encaminhamento, sistema) |

## Estrutura

```
src/
├── main.jsx                 # ponto de entrada
├── App.jsx                  # BrowserRouter + AppLayout + rotas
├── index.css                # base global
├── styles/theme.css         # tokens de design (cores, criticidade, espaçamento)
├── routes/AppRoutes.jsx     # definição das rotas
├── layouts/                 # AppLayout (sidebar + área de conteúdo)
├── components/              # Icon, Badges (criticidade/status/IA), PageHeader, PublicTopbar
├── data/                    # dados mockados (denúncias, dashboard, órgãos, notificações, protocolo)
└── pages/                   # Portal/Home, Denunciar, Acompanhar (público) + Dashboard, Mapa, Denuncias, Orgaos, Notificacoes, Login
```

## Sistema de design

Identidade reaproveitada do protótipo Prisma Recife:

- **Marca:** azul Recife `#005AA7` (sidebar escura `#003B6F`)
- **Criticidade:** Crítico `#D62828` · Alto `#E1742A` · Médio `#E9A23B` · Baixo `#2A9D8F`
- **Divergência da IA / revisão:** roxo `#7A4FBF`
- **Encaminhado:** verde `#2A9D8F`

Os tokens ficam centralizados em `src/styles/theme.css`.

## Observações

- Os dados (denúncias, KPIs, órgãos, notificações) vivem em `src/data/` e são fixos.
- Interações como marcar notificação como lida, ativar/desativar órgão e filtrar
  denúncias funcionam **em memória** (estado do React), sem persistência.
- As posições do mapa são aproximadas e servem apenas à visualização — não são
  coordenadas geográficas reais.
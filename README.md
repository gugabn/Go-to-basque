# Rumo à Basque

App pessoal de poupança — controlar o caminho financeiro até à **Basque Culinary**,
com meta, ritmo mensal, projeção e as certificações necessárias (STCW, ENG1,
DELE B2, …) antes de embarcar.

Foi extraída do projeto **ChefBook**, onde vivia como o separador «Finanças».
Passou a ser uma aplicação Next.js autónoma.

## Stack

- **Next.js** 16.2.6 · **React** 19.2 · **TypeScript** · **Tailwind v4**
- Mobile-first, instalável como PWA
- Sem backend: os dados ficam no `localStorage` do dispositivo

## Arranque

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## O que faz

- **Painel de progresso** — quanto já poupaste face à meta, com estado (adiantado / atrasado)
- **Ritmo** — quanto precisas de poupar por mês e quanto vai no mês corrente,
  incluindo a percentagem do salário estimado
- **Projeção** — ao ritmo médio atual, quando chegas à meta face ao prazo
- **Anuidades** — a meta dividida em fatias (ex.: 4 anos da Basque)
- **Marcos e certificações** — passos com custo e prazo, com alertas de atraso
- **Lançamentos** — depósitos e levantamentos
- **Cópia de segurança** — exportar / importar tudo em JSON

## Estrutura

```
app/            layout (fonts, PWA), page.tsx (orquestrador), globals.css
hooks/useStore  estado central + persistência (localStorage)
lib/            types · storage · finance · backup
components/
  ├ Header.tsx
  ├ FinanceView.tsx
  ├ modals/     AddContribution · AddMilestone · FinanceGoal · Settings
  └ ui/         Sheet · Toast
```

## Dados

Guardados no `localStorage` sob as chaves `rumobasque_contributions`,
`rumobasque_goal` e `rumobasque_milestones`. O backup é um ficheiro
`rumo-basque-backup-AAAA-MM-DD.json`.

### Migração do ChefBook

No primeiro arranque, a app importa uma única vez os dados que existiam no
separador Finanças do ChefBook (chaves `chefbook_contributions`,
`chefbook_finance_goal` e `chefbook_milestones`) para as chaves novas
`rumobasque_*`. Ver `migrateLegacyData()` em `lib/storage.ts`.

A importação é **por-chave e não-destrutiva**: só copia uma chave antiga se a
correspondente nova ainda não existir, por isso nunca sobrescreve dados já
criados aqui.

> Ressalva: o `localStorage` é por origem. A importação só encontra os dados
> antigos se as duas apps correrem na **mesma origem** — por exemplo ambas em
> `localhost:3000` durante o desenvolvimento, ou publicadas no mesmo domínio.
> Em origens diferentes não há dados antigos a ler, e a app arranca com os
> valores por defeito.

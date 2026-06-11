# Plano de Implementação — Memorial de Incorporação Projetse

Documento oficial para orientar a evolução do protótipo Lovable para um produto funcional.

Data de criação: 2026-06-10

## 1. Resumo do Produto

O sistema é uma plataforma web da Projetse para automatizar a produção, revisão e exportação de Memoriais de Incorporação a partir dos quadros técnicos/NBR 12.721 já elaborados pela equipe.

O produto atende principalmente:

- Responsável técnica pela elaboração do memorial, que precisa conferir dados, validar unidades, revisar seções e gerar documentos com menos retrabalho.
- Revisora técnica, que precisa validar coerência, detectar pendências e aprovar seções.
- Gestora da Projetse, que precisa acompanhar andamento, gargalos, produtividade e histórico dos memoriais.

O problema central é reduzir o trabalho manual de copiar, adaptar e conferir informações técnicas repetitivas, diminuindo risco de erro em áreas, frações, unidades, vagas, confrontações e textos jurídicos/documentais.

Módulos principais que serão funcionais:

- Autenticação e perfis de usuário.
- Dashboard operacional.
- Cadastro e gestão de empreendimentos.
- Upload e armazenamento de quadros técnicos.
- Extração e validação de dados técnicos.
- Gestão de unidades autônomas.
- Geração, revisão e aprovação de seções do memorial.
- Biblioteca de cláusulas e modelos documentais.
- Exportação e versionamento de documentos.
- Histórico/auditoria.
- Configurações da organização, usuários e permissões.

## 2. Diagnóstico do Projeto Atual

### Stack Encontrada

- React 19 com TypeScript em modo `strict`.
- TanStack Start e TanStack Router com rotas file-based em `src/routes/`.
- Vite via `@lovable.dev/vite-tanstack-config`.
- TanStack Query configurado em `src/router.tsx` e `src/routes/__root.tsx`.
- Tailwind CSS 4 com design system Projetse em `src/styles.css`.
- Shadcn UI/Radix UI em `src/components/ui/`.
- Sonner para toasts.
- Lucide React para ícones.
- Cloudflare Workers configurado por `wrangler.jsonc`, `src/server.ts` e `src/start.ts`.
- `pnpm-lock.yaml` presente e `bun.lock` também presente; a execução do projeto deve ser padronizada em `pnpm`.

### Páginas e Rotas Existentes

- `/` em `src/routes/_app.index.tsx`: dashboard com indicadores e empreendimentos recentes.
- `/empreendimentos` em `src/routes/_app.empreendimentos.index.tsx`: listagem com busca e filtros.
- `/empreendimentos/novo` em `src/routes/_app.empreendimentos.novo.tsx`: wizard visual de upload, extração e revisão.
- `/empreendimentos/$id` em `src/routes/_app.empreendimentos.$id.tsx`: tela central com abas de visão geral, quadro técnico, dados extraídos, dados do condomínio, unidades, memorial, exportações e histórico.
- `/modelos` em `src/routes/_app.modelos.tsx`: modelos de documento.
- `/clausulas` em `src/routes/_app.clausulas.tsx`: biblioteca de cláusulas.
- `/historico` em `src/routes/_app.historico.tsx`: timeline global.
- `/configuracoes` em `src/routes/_app.configuracoes.tsx`: configurações visuais.

### Componentes Principais

- `src/components/app-sidebar.tsx`: navegação lateral e perfil fictício.
- `src/components/page-header.tsx`: header contextual, breadcrumb e notificações simuladas.
- `src/components/status-badge.tsx`: padronização visual dos status.
- `src/components/ui/*`: componentes base Shadcn/Radix.

### Mocks Existentes

- `src/lib/mock-data.ts`: principal fonte de dados mockados para empreendimentos, unidades, seções do memorial, histórico, modelos, cláusulas e indicadores.
- `src/routes/_app.empreendimentos.$id.tsx`: contém mocks locais adicionais como dados do imóvel, pavimentos, áreas comuns, representantes e estados locais de edição.
- `src/routes/_app.empreendimentos.novo.tsx`: contém `mockExtraido` e simula processamento de arquivo com `setTimeout`.
- `src/routes/_app.configuracoes.tsx`: usuários, permissões, empresa e status do sistema são estáticos.

### O Que Precisa Ser Conectado ao Backend

- Login, sessão, recuperação de senha e proteção de rotas.
- Usuários, papéis e permissões.
- Empreendimentos e seus dados cadastrais.
- Incorporadoras, representantes legais, imóveis, confrontações e dados técnicos.
- Upload e armazenamento dos quadros técnicos.
- Dados extraídos, validações e status por campo.
- Unidades autônomas, vagas, áreas, frações e confrontações.
- Modelos, cláusulas e variáveis.
- Seções geradas do memorial, revisões, aprovações e versões.
- Exportações e arquivos gerados.
- Histórico de eventos/auditoria.
- Configurações da organização.

### O Que Precisa Ser Refatorado

- Modularizar `src/routes/_app.empreendimentos.$id.tsx`, que concentra a maior parte da esteira em um único arquivo grande.
- Separar domínio em `src/features/*`, preservando componentes globais em `src/components/`.
- Criar uma camada de dados explícita com services/hooks e TanStack Query.
- Isolar mocks em uma camada temporária de fallback para migração gradual.
- Trocar formulários locais por formulários tipados com validação, usando `react-hook-form` e `zod` onde houver entrada real.
- Tornar breadcrumbs navegáveis quando aplicável.
- Implementar navegação responsiva mínima para sidebar em tablet/mobile.
- Corrigir divergência de package manager e registrar a decisão por `pnpm`.

### Pontos Problemáticos

- Não existe diretório `supabase/`.
- Não existem migrations, RLS, storage buckets ou Edge Functions.
- `.env.local` tem variáveis Supabase, mas elas ainda não são consumidas pelo código.
- `@supabase/supabase-js` ainda não está instalado.
- Dados são perdidos ao atualizar a página, pois dependem de mocks e estado local.
- Exportação, upload, extração e geração documental são apenas simulações.
- Não há testes automatizados.
- Não há README ou documentação operacional além do PRD e deste plano.

## 3. Mudança de Fase

Este projeto saiu da fase de protótipo visual criado no Lovable e entrou na fase de produto funcional.

A partir deste plano:

- Mocks serão substituídos gradualmente por dados reais.
- Supabase passa a ser parte obrigatória das primeiras Epics.
- Autenticação real será criada com Supabase Auth.
- Banco de dados, migrations, RLS, storage e Edge Functions passam a fazer parte do escopo.
- O schema oficial do banco de dados é `projetse`; todas as tabelas, views, funções SQL, triggers, policies e migrations de negócio devem ser criadas dentro desse schema.
- O schema `public` não deve receber tabelas de negócio novas. Ele só poderá ser usado quando exigido por extensões, recursos nativos do Supabase ou compatibilidade explícita.
- O PRD antigo deve ser usado como referência de produto, fluxo, linguagem e UX, mas não como limitação técnica.
- Trechos do PRD que dizem para não usar banco, backend, autenticação real, upload real ou geração real pertencem apenas à fase Lovable e não se aplicam mais.
- A UI boa já criada deve ser preservada, mas conectada a dados reais por etapas.

## 4. Arquitetura Recomendada

### Organização do Frontend

Manter a base TanStack Start/Router atual e organizar a evolução por domínio:

```text
src/
  components/
    ui/
    app-sidebar.tsx
    page-header.tsx
    status-badge.tsx
  features/
    auth/
    dashboard/
    empreendimentos/
    quadros-tecnicos/
    dados-extraidos/
    unidades/
    memorial/
    documentos/
    configuracoes/
  hooks/
  lib/
    supabase/
    utils.ts
    format.ts
  routes/
```

Diretrizes:

- Rotas em `src/routes/` devem ficar finas, delegando UI e lógica para `src/features/*`.
- Componentes genéricos permanecem em `src/components/` e `src/components/ui/`.
- Tipos de domínio devem ficar próximos das features ou em `src/features/*/types.ts`.
- Mocks devem ser preservados temporariamente, mas isolados como seed/fallback, não como fonte permanente.

### Organização da Camada de Dados

Criar uma camada explícita:

```text
src/lib/supabase/client.ts
src/features/empreendimentos/services/empreendimentos-service.ts
src/features/empreendimentos/hooks/use-empreendimentos.ts
src/features/unidades/services/unidades-service.ts
src/features/memorial/services/memorial-service.ts
```

Diretrizes:

- Usar TanStack Query para leitura, cache e invalidação.
- Usar mutations para criação, edição, validação, aprovação e exportação.
- Validar inputs com Zod antes de gravar dados reais.
- Evitar acesso Supabase direto em componentes complexos; componentes devem consumir hooks/services.

### Supabase Client

Criar:

- `src/lib/supabase/client.ts` para client-side com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- `src/lib/supabase/types.ts` gerado a partir do schema Supabase quando a CLI estiver configurada, usando `projetse` como schema de negócio.
- Padrão server-side/Edge Function para ações sensíveis.

Regras:

- `anon key` apenas no client e sempre protegida por RLS.
- `service_role` somente em Edge Functions ou ambientes seguros.
- Nunca expor segredos no navegador.
- Todas as queries para tabelas de negócio devem apontar para o schema `projetse`, via configuração de schema exposto no Supabase/API ou helper centralizado no client.

### Auth

Implementar Supabase Auth nas primeiras Epics:

- Tela de login.
- Recuperação de senha.
- Sessão persistida.
- Proteção do layout `_app`.
- Logout.
- Perfil do usuário logado na sidebar.
- Papéis iniciais: `admin`, `gestora`, `responsavel_tecnica`, `revisora`.

### RLS

RLS deve ser habilitado desde a primeira migration de cada tabela.

Estratégia inicial:

- Todas as policies de negócio devem ser criadas em tabelas do schema `projetse`.
- Todas as tabelas de negócio devem ter `organization_id`.
- Usuários acessam dados pela associação em `organization_members`.
- Escrita limitada por papel.
- Auditoria append-only.
- Arquivos em Storage vinculados à organização e ao empreendimento.

### Services e Hooks

Padrão recomendado:

- `useEmpreendimentos()` lista empreendimentos reais.
- `useEmpreendimento(id)` busca detalhe.
- `useCreateEmpreendimento()` cria empreendimento.
- `useUpdateEmpreendimento()` edita dados cadastrais.
- `useUnidades(empreendimentoId)` lista unidades.
- `useUpdateUnidade()` valida ou edita unidade.
- `useMemorialSections(empreendimentoId)` lista seções.
- `useApproveMemorialSection()` aprova seção.
- `useHistorico(empreendimentoId)` busca eventos.

### Storage

Buckets iniciais:

- `quadros-tecnicos`: PDFs, XLSX ou arquivos técnicos enviados.
- `documentos-gerados`: DOCX/PDF exportados.
- `anexos-empreendimentos`: documentos auxiliares futuros.

Políticas:

- Usuário autenticado só acessa arquivos da própria organização.
- Upload permitido para papéis técnicos autorizados.
- Download de documento final permitido conforme papel.

### Edge Functions

Edge Functions recomendadas:

- `processar-quadro-tecnico`: registra metadados e inicia extração real ou semi-real.
- `gerar-memorial`: gera seções a partir de dados validados e templates.
- `exportar-documento`: gera DOCX/PDF e grava no storage.
- `registrar-evento-auditoria`: opcional se a auditoria exigir centralização server-side.

Todas devem:

- Validar payload com Zod.
- Verificar sessão/usuário.
- Usar `service_role` apenas quando necessário.
- Registrar eventos em `audit_events`.

### Estratégia Para Substituir Mocks Sem Quebrar a UI

1. Manter UI e rotas atuais.
2. Criar o schema Supabase `projetse` compatível com os dados usados pela UI.
3. Criar seeds com dados equivalentes ao Residencial Madrid.
4. Trocar dashboard e lista de empreendimentos para dados reais primeiro.
5. Conectar detalhe do empreendimento por abas.
6. Remover mocks locais somente depois que cada tela tiver dados reais, carregamento, erro e estado vazio.
7. Preservar `mock-data.ts` temporariamente como referência de seed e teste visual.

## 5. Plano por Epics

### EPIC-01 — Fundação Supabase e Ambiente

- Objetivo: iniciar Supabase no projeto e preparar ambiente para backend real.
- Prioridade: Alta.
- Dependências: nenhuma.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como dev, quero um diretório `supabase/` versionado para gerenciar schema e migrations.
  - Como dev, quero env vars documentadas para rodar o projeto com Supabase.
  - Como dev, quero tipos gerados do banco para consumir dados com segurança.
- Arquivos prováveis envolvidos:
  - `supabase/config.toml`
  - `supabase/migrations/*`
  - `supabase/seed.sql`
  - `src/lib/supabase/client.ts`
  - `src/lib/supabase/types.ts`
  - `.env.example`
  - `package.json`
- Critérios de aceite:
  - Supabase local/remoto configurado.
  - Schema `projetse` criado e definido como schema oficial de negócio.
  - Nenhuma tabela de negócio criada em `public`.
  - Primeira migration executável.
  - Cliente Supabase criado.
  - Variáveis documentadas sem expor segredos.
  - Projeto continua rodando com `pnpm dev`.

### EPIC-02 — Modelagem Inicial, Migrations, Seeds e RLS

- Objetivo: criar o schema real inicial com RLS para substituir os principais mocks.
- Prioridade: Alta.
- Dependências: EPIC-01.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como admin, quero organizações e membros para controlar acesso.
  - Como técnica, quero cadastrar e visualizar empreendimentos reais.
  - Como revisora, quero acessar apenas dados autorizados.
  - Como sistema, quero registrar auditoria dos eventos principais.
- Arquivos prováveis envolvidos:
  - `supabase/migrations/*_create_core_schema.sql`
  - `supabase/migrations/*_create_rls_policies.sql`
  - `supabase/seed.sql`
  - `src/lib/mock-data.ts`
- Critérios de aceite:
  - Tabelas core criadas dentro do schema `projetse`.
  - RLS habilitado em todas as tabelas de negócio do schema `projetse`.
  - Policies mínimas de select/insert/update/delete criadas.
  - Seeds incluem Projetse e Residencial Madrid.
  - Usuário sem organização não acessa dados.

### EPIC-03 — Autenticação Real e Controle de Permissões

- Objetivo: implementar Supabase Auth e proteger o app.
- Prioridade: Alta.
- Dependências: EPIC-01, EPIC-02.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como usuário, quero fazer login e logout.
  - Como usuário, quero recuperar minha senha.
  - Como gestora, quero visualizar meu perfil e papel.
  - Como sistema, quero impedir acesso a rotas internas sem sessão.
- Arquivos prováveis envolvidos:
  - `src/features/auth/*`
  - `src/routes/login.tsx`
  - `src/routes/_app.tsx`
  - `src/components/app-sidebar.tsx`
  - `src/routes/_app.configuracoes.tsx`
- Critérios de aceite:
  - Rotas internas exigem autenticação.
  - Sidebar mostra usuário real.
  - Permissões básicas por papel funcionando.
  - RLS validada com usuários de papéis diferentes.

### EPIC-04 — Empreendimentos Reais e Dashboard

- Objetivo: substituir mocks de dashboard e lista por dados reais.
- Prioridade: Alta.
- Dependências: EPIC-02, EPIC-03.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como gestora, quero ver indicadores calculados com dados reais.
  - Como técnica, quero listar, filtrar e buscar empreendimentos reais.
  - Como técnica, quero criar e editar um empreendimento.
- Arquivos prováveis envolvidos:
  - `src/routes/_app.index.tsx`
  - `src/routes/_app.empreendimentos.index.tsx`
  - `src/routes/_app.empreendimentos.novo.tsx`
  - `src/features/empreendimentos/*`
  - `src/features/dashboard/*`
- Critérios de aceite:
  - Dashboard não depende de `mock-data.ts`.
  - Lista de empreendimentos vem do Supabase.
  - Criação grava no banco.
  - Loading, erro e estado vazio tratados.
  - Auditoria registra criação/edição.

### EPIC-05 — Modularização da Esteira do Empreendimento

- Objetivo: quebrar a tela central em componentes/features antes de conectar todas as abas.
- Prioridade: Alta.
- Dependências: EPIC-04.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como dev, quero a rota de detalhe mais simples e sustentável.
  - Como técnica, quero manter a mesma experiência visual após a refatoração.
- Arquivos prováveis envolvidos:
  - `src/routes/_app.empreendimentos.$id.tsx`
  - `src/features/empreendimentos/components/*`
  - `src/features/quadros-tecnicos/*`
  - `src/features/dados-extraidos/*`
  - `src/features/unidades/*`
  - `src/features/memorial/*`
- Critérios de aceite:
  - UI preservada.
  - Rota de detalhe delega abas a componentes.
  - Nenhuma funcionalidade visual existente é perdida sem justificativa.
  - Build e lint sem regressões.

### EPIC-06 — Upload Real e Quadro Técnico

- Objetivo: substituir upload simulado por armazenamento real e metadados no banco.
- Prioridade: Alta.
- Dependências: EPIC-02, EPIC-03, EPIC-05.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como técnica, quero enviar um quadro técnico real.
  - Como técnica, quero ver status de processamento.
  - Como sistema, quero armazenar arquivo e metadados com segurança.
- Arquivos prováveis envolvidos:
  - `src/features/quadros-tecnicos/*`
  - `supabase/functions/processar-quadro-tecnico/*`
  - `supabase/migrations/*_create_quadro_tecnico.sql`
- Critérios de aceite:
  - Upload grava arquivo em bucket privado.
  - Metadados são salvos no banco.
  - RLS/Storage policies impedem acesso indevido.
  - Estado visual de processamento continua funcionando.

### EPIC-07 — Dados Extraídos e Validação Técnica

- Objetivo: persistir campos extraídos, confiança, revisão e validação.
- Prioridade: Alta.
- Dependências: EPIC-06.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como técnica, quero revisar campos extraídos e editar valores.
  - Como técnica, quero confirmar blocos de dados.
  - Como sistema, quero registrar quem validou cada campo/bloco.
- Arquivos prováveis envolvidos:
  - `src/features/dados-extraidos/*`
  - `supabase/migrations/*_create_extracted_data.sql`
  - `supabase/functions/processar-quadro-tecnico/*`
- Critérios de aceite:
  - Dados extraídos persistem.
  - Status por campo/bloco é salvo.
  - Histórico registra validações e edições.
  - Campos críticos têm validação com Zod e constraints no banco quando aplicável.

### EPIC-08 — Unidades Autônomas Reais

- Objetivo: conectar unidades, vagas, áreas, frações e confrontações ao banco.
- Prioridade: Alta.
- Dependências: EPIC-07.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como técnica, quero visualizar unidades reais do empreendimento.
  - Como técnica, quero editar e validar unidade por unidade.
  - Como técnica, quero aplicar edição em massa quando seguro.
  - Como revisora, quero identificar inconsistências.
- Arquivos prováveis envolvidos:
  - `src/features/unidades/*`
  - `supabase/migrations/*_create_unidades.sql`
  - `supabase/migrations/*_create_validacoes.sql`
- Critérios de aceite:
  - Tabela de unidades usa dados reais.
  - Edição e validação persistem.
  - Filtros funcionam com dados reais.
  - Preview textual usa dados salvos.
  - RLS impede edição por usuário não autorizado.

### EPIC-09 — Modelos, Cláusulas e Motor de Memorial

- Objetivo: persistir biblioteca documental e gerar seções do memorial a partir de templates e dados reais.
- Prioridade: Alta.
- Dependências: EPIC-08.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como admin, quero gerenciar modelos e cláusulas.
  - Como técnica, quero gerar seções do memorial com dados validados.
  - Como revisora, quero aprovar ou marcar pendência em uma seção.
- Arquivos prováveis envolvidos:
  - `src/routes/_app.modelos.tsx`
  - `src/routes/_app.clausulas.tsx`
  - `src/features/documentos/*`
  - `src/features/memorial/*`
  - `supabase/functions/gerar-memorial/*`
  - `supabase/migrations/*_create_document_templates.sql`
- Critérios de aceite:
  - Modelos e cláusulas vêm do banco.
  - Seções são geradas e versionadas.
  - Aprovação/pedência persiste.
  - Histórico registra geração, edição e aprovação.

### EPIC-10 — Exportação, Versionamento e Storage de Documentos

- Objetivo: gerar e armazenar documentos exportáveis.
- Prioridade: Média/Alta.
- Dependências: EPIC-09.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como técnica, quero exportar versão de revisão.
  - Como gestora, quero exportar versão final somente sem pendências bloqueantes.
  - Como sistema, quero versionar arquivos gerados.
- Arquivos prováveis envolvidos:
  - `src/features/memorial/*`
  - `src/features/documentos/*`
  - `supabase/functions/exportar-documento/*`
  - `supabase/migrations/*_create_document_exports.sql`
- Critérios de aceite:
  - Exportação cria registro no banco.
  - Arquivo gerado fica em Storage.
  - Exportação final bloqueia quando há pendências.
  - Histórico de exportações usa dados reais.

### EPIC-11 — Configurações, Usuários e Auditoria

- Objetivo: tornar configurações e gestão de usuários funcionais.
- Prioridade: Média.
- Dependências: EPIC-03.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como admin, quero gerenciar membros e papéis.
  - Como admin, quero configurar dados da Projetse.
  - Como gestora, quero consultar histórico real.
- Arquivos prováveis envolvidos:
  - `src/routes/_app.configuracoes.tsx`
  - `src/routes/_app.historico.tsx`
  - `src/features/configuracoes/*`
  - `supabase/migrations/*_create_settings_audit.sql`
- Critérios de aceite:
  - Configurações persistem.
  - Usuários e permissões refletem o banco.
  - Histórico global usa `audit_events`.
  - Alterações sensíveis geram auditoria.

### EPIC-12 — Qualidade, Acessibilidade, Performance e Observabilidade

- Objetivo: elevar confiabilidade antes de lançamento.
- Prioridade: Média.
- Dependências: EPIC-04 em diante.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como usuário, quero telas rápidas e estados claros.
  - Como dev, quero detectar erros e regressões.
  - Como gestora, quero confiar nos dados exibidos.
- Arquivos prováveis envolvidos:
  - `src/components/*`
  - `src/features/*`
  - `eslint.config.js`
  - `tsconfig.json`
  - documentação em `docs/`
- Critérios de aceite:
  - Build e typecheck passam.
  - Fluxos críticos testados.
  - Estados de erro/loading/empty revisados.
  - Principais telas acessíveis por teclado.
  - Logs de erro client/server revisados.

### EPIC-13 — Preparação para Lançamento

- Objetivo: preparar deploy produtivo com segurança e rollback.
- Prioridade: Alta no final do ciclo.
- Dependências: EPIC-01 a EPIC-12.
- Status inicial: `Não iniciado`.
- User Stories principais:
  - Como gestora, quero uma versão pronta para uso controlado.
  - Como dev, quero checklist de Go-Live e rollback.
- Arquivos prováveis envolvidos:
  - `wrangler.jsonc`
  - `vite.config.ts`
  - `docs/plano-implementacao.md`
  - `.env.example`
  - Supabase dashboard/configurações
- Critérios de aceite:
  - Build produtivo validado.
  - Env vars revisadas.
  - RLS testada.
  - Deploy validado.
  - Rollback documentado.

## 6. Plano de Banco de Dados Supabase

Schema oficial: `projetse`.

Todas as alterações de banco devem respeitar estas regras:

- Criar o schema com `create schema if not exists projetse;`.
- Criar todas as tabelas de negócio como `projetse.<nome_da_tabela>`.
- Criar funções auxiliares, triggers, views e policies de negócio no schema `projetse`.
- Referenciar tabelas internas sempre com schema explícito, por exemplo `references projetse.organizations(id)`.
- Referências ao Supabase Auth devem continuar apontando para `auth.users`.
- Evitar tabelas de negócio no schema `public`.
- Garantir `grant usage on schema projetse` e permissões necessárias para `authenticated`, `anon` apenas quando compatível com RLS e o modelo de segurança.
- Configurar o Supabase para expor o schema `projetse` nas APIs quando a aplicação precisar acessá-lo diretamente via `supabase-js`.
- Quando este documento citar uma tabela sem prefixo por brevidade, ela deve ser interpretada como `projetse.<tabela>`.

### Tabelas Necessárias

#### `projetse.organizations`

- `id uuid primary key`
- `name text not null`
- `slug text unique not null`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `projetse.profiles`

- `id uuid primary key references auth.users(id)`
- `full_name text not null`
- `email text not null`
- `avatar_url text`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `projetse.organization_members`

- `id uuid primary key`
- `organization_id uuid references projetse.organizations(id)`
- `user_id uuid references projetse.profiles(id)`
- `role text check (role in ('admin', 'gestora', 'responsavel_tecnica', 'revisora'))`
- `status text check (status in ('active', 'invited', 'disabled'))`
- `created_at timestamptz`

#### `projetse.empreendimentos`

- `id uuid primary key`
- `organization_id uuid references projetse.organizations(id)`
- `nome text not null`
- `incorporadora_id uuid references projetse.incorporadoras(id)`
- `cidade text`
- `uf text`
- `endereco text`
- `lote text`
- `quadra text`
- `matricula text`
- `responsavel_id uuid references projetse.profiles(id)`
- `status text`
- `progresso integer`
- `pendencias_count integer`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `projetse.incorporadoras`

- `id uuid primary key`
- `organization_id uuid references projetse.organizations(id)`
- `razao_social text not null`
- `cnpj text`
- `endereco jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `projetse.representantes_legais`

- `id uuid primary key`
- `incorporadora_id uuid references projetse.incorporadoras(id)`
- `nome text not null`
- `cpf text`
- `rg text`
- `estado_civil text`
- `regime_comunhao text`
- `endereco jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `projetse.imoveis`

- `id uuid primary key`
- `empreendimento_id uuid references projetse.empreendimentos(id)`
- `lote_numero text`
- `lote_extenso text`
- `quadra_numero text`
- `quadra_extenso text`
- `loteamento text`
- `cidade text`
- `comarca text`
- `uf text`
- `estado_extenso text`
- `area_numero numeric`
- `area_extenso text`
- `benfeitorias text`
- `matricula_numero text`
- `matricula_extenso text`
- `cartorio text`

#### `projetse.imovel_confrontacoes`

- `id uuid primary key`
- `imovel_id uuid references projetse.imoveis(id)`
- `direcao text`
- `confrontante text`
- `medida text`
- `azimute text`
- `ordem integer`

#### `projetse.dados_tecnicos`

- `id uuid primary key`
- `empreendimento_id uuid references projetse.empreendimentos(id)`
- `area_terreno numeric`
- `area_global numeric`
- `area_privativa_total numeric`
- `area_comum_total numeric`
- `torres integer`
- `pavimentos integer`
- `unidades integer`
- `vagas integer`
- `alvara text`
- `data_aprovacao date`
- `responsavel_tecnico text`
- `crea_cau text`
- `art_rrt text`

#### `projetse.quadros_tecnicos`

- `id uuid primary key`
- `empreendimento_id uuid references projetse.empreendimentos(id)`
- `storage_path text not null`
- `file_name text not null`
- `mime_type text`
- `size_bytes bigint`
- `status text check (status in ('enviado', 'processando', 'processado', 'erro'))`
- `uploaded_by uuid references projetse.profiles(id)`
- `created_at timestamptz`
- `processed_at timestamptz`

#### `projetse.dados_extraidos`

- `id uuid primary key`
- `empreendimento_id uuid references projetse.empreendimentos(id)`
- `quadro_tecnico_id uuid references projetse.quadros_tecnicos(id)`
- `bloco text not null`
- `campo text not null`
- `valor text`
- `valor_normalizado jsonb`
- `confianca numeric`
- `status text check (status in ('extraido', 'confirmado', 'editado', 'baixa_confianca', 'pendente'))`
- `reviewed_by uuid references projetse.profiles(id)`
- `reviewed_at timestamptz`

#### `projetse.unidades_autonomas`

- `id uuid primary key`
- `empreendimento_id uuid references projetse.empreendimentos(id)`
- `nome text not null`
- `torre text`
- `pavimento text`
- `tipo text`
- `posicao text`
- `area_privativa numeric`
- `area_comum numeric`
- `area_total numeric`
- `area_garden numeric`
- `area_garagem numeric`
- `fracao text`
- `vaga text`
- `confrontacoes text`
- `observacoes text`
- `status text check (status in ('validado', 'pendente', 'inconsistencia', 'nao_revisado'))`
- `updated_at timestamptz`

#### `projetse.modelos_documento`

- `id uuid primary key`
- `organization_id uuid references projetse.organizations(id)`
- `nome text not null`
- `tipo text`
- `status text`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `projetse.clausulas`

- `id uuid primary key`
- `organization_id uuid references projetse.organizations(id)`
- `modelo_id uuid references projetse.modelos_documento(id)`
- `titulo text not null`
- `categoria text`
- `resumo text`
- `template text not null`
- `variaveis text[]`
- `status text`
- `ordem integer`
- `updated_at timestamptz`

#### `projetse.memoriais`

- `id uuid primary key`
- `empreendimento_id uuid references projetse.empreendimentos(id)`
- `versao integer not null`
- `status text check (status in ('rascunho', 'gerado', 'em_revisao', 'aprovado', 'exportado'))`
- `created_by uuid references projetse.profiles(id)`
- `created_at timestamptz`

#### `projetse.memorial_secoes`

- `id uuid primary key`
- `memorial_id uuid references projetse.memoriais(id)`
- `clausula_id uuid references projetse.clausulas(id)`
- `titulo text not null`
- `conteudo text`
- `status text check (status in ('nao_gerada', 'gerada', 'em_revisao', 'com_pendencia', 'aprovada'))`
- `ordem integer`
- `approved_by uuid references projetse.profiles(id)`
- `approved_at timestamptz`
- `updated_at timestamptz`

#### `projetse.document_exports`

- `id uuid primary key`
- `memorial_id uuid references projetse.memoriais(id)`
- `empreendimento_id uuid references projetse.empreendimentos(id)`
- `tipo text check (tipo in ('revisao', 'final'))`
- `formato text check (formato in ('docx', 'pdf'))`
- `storage_path text`
- `status text`
- `created_by uuid references projetse.profiles(id)`
- `created_at timestamptz`

#### `projetse.pendencias`

- `id uuid primary key`
- `empreendimento_id uuid references projetse.empreendimentos(id)`
- `entidade_tipo text`
- `entidade_id uuid`
- `severidade text check (severidade in ('info', 'atencao', 'bloqueante'))`
- `mensagem text not null`
- `status text check (status in ('aberta', 'resolvida', 'ignorada'))`
- `created_by uuid references projetse.profiles(id)`
- `resolved_by uuid references projetse.profiles(id)`
- `created_at timestamptz`
- `resolved_at timestamptz`

#### `projetse.audit_events`

- `id uuid primary key`
- `organization_id uuid references projetse.organizations(id)`
- `empreendimento_id uuid references projetse.empreendimentos(id)`
- `user_id uuid references projetse.profiles(id)`
- `event_type text not null`
- `description text not null`
- `metadata jsonb`
- `created_at timestamptz`

### Relacionamentos Principais

- Uma organização possui muitos membros, empreendimentos, modelos e cláusulas.
- Um empreendimento pertence a uma organização e pode ter uma incorporadora.
- Uma incorporadora possui representantes legais.
- Um empreendimento possui imóvel, dados técnicos, quadros técnicos, dados extraídos, unidades, memoriais, exportações, pendências e eventos.
- Um memorial possui várias seções.
- Uma seção pode nascer de uma cláusula/template.
- Exportações pertencem a memoriais e apontam para arquivos em Storage.

### Migrations Prováveis

- `0001_create_projetse_schema.sql`
- `0002_create_projetse_organizations_profiles_members.sql`
- `0003_create_projetse_empreendimentos_core.sql`
- `0004_create_projetse_quadros_extracted_data.sql`
- `0005_create_projetse_unidades_pendencias.sql`
- `0006_create_projetse_templates_memoriais_exports.sql`
- `0007_create_projetse_audit_events.sql`
- `0008_create_storage_buckets_and_policies.sql`
- `0009_create_projetse_rls_policies.sql`

Toda migration deve usar schema explícito. Exemplo:

```sql
create schema if not exists projetse;

create table if not exists projetse.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Políticas RLS Necessárias

Padrão mínimo:

- `projetse.profiles`: usuário lê/edita seu próprio perfil; admins leem membros da organização.
- `projetse.organization_members`: membros ativos leem membros da própria organização; apenas admin gerencia papéis.
- Tabelas com `organization_id`: acesso permitido se `auth.uid()` for membro ativo da organização.
- Tabelas ligadas a `empreendimento_id`: acesso herdado pela organização do empreendimento.
- Escrita:
  - `admin` e `gestora`: gerenciam organização, usuários e configurações.
  - `responsavel_tecnica`: cria/edita empreendimentos, dados técnicos, unidades, memorial e exportações.
  - `revisora`: revisa, aprova, comenta e marca pendências.
- `projetse.audit_events`: insert autenticado via função controlada; update/delete bloqueados.
- Storage: acesso por path contendo `organization_id` e validação via policies.

### Buckets de Storage

- `quadros-tecnicos`: privado.
- `documentos-gerados`: privado.
- `anexos-empreendimentos`: privado.

### Edge Functions Necessárias

- `processar-quadro-tecnico`
- `gerar-memorial`
- `exportar-documento`

### Seeds Iniciais

- Organização Projetse.
- Usuários de exemplo para admin, responsável técnica, revisora e gestora.
- Residencial Madrid.
- Incorporadora Pitangueiras SPE LTDA.
- Dados técnicos principais do PRD.
- Unidades iniciais equivalentes ao mock atual.
- Modelos e cláusulas iniciais a partir de `src/lib/mock-data.ts`.

## 7. Plano de Migração de Mocks Para Dados Reais

### Mocks Existentes e Substituição

| Mock atual | Local | Substituição no banco |
| ---------- | ----- | --------------------- |
| `empreendimentos` | `src/lib/mock-data.ts` | `empreendimentos`, `incorporadoras`, `dados_tecnicos` |
| `indicadoresDashboard` | `src/lib/mock-data.ts` | queries agregadas em `empreendimentos`, `memoriais`, `pendencias`, `document_exports` |
| `unidadesResidencialMadrid` | `src/lib/mock-data.ts` | `unidades_autonomas` |
| `secoesMemorial` | `src/lib/mock-data.ts` | `memoriais`, `memorial_secoes`, `clausulas` |
| `historico` | `src/lib/mock-data.ts` | `audit_events` |
| `modelos` | `src/lib/mock-data.ts` | `modelos_documento` |
| `clausulas` | `src/lib/mock-data.ts` | `clausulas` |
| `mockExtraido` | `src/routes/_app.empreendimentos.novo.tsx` | `quadros_tecnicos`, `dados_extraidos`, `dados_tecnicos`, `unidades_autonomas` |
| `IMOVEL_MOCK` | `src/routes/_app.empreendimentos.$id.tsx` | `imoveis`, `imovel_confrontacoes` |
| `PAVIMENTOS_MOCK` e `AREAS_COMUNS_MOCK` | `src/routes/_app.empreendimentos.$id.tsx` | `dados_tecnicos` ou tabelas auxiliares futuras |
| usuários/permissões mockados | `src/routes/_app.configuracoes.tsx` | `profiles`, `organization_members` |

### Ordem de Substituição

1. Autenticação e perfil real.
2. Organização e membros.
3. Dashboard e lista de empreendimentos.
4. Cadastro/edição básica de empreendimento.
5. Detalhe: visão geral.
6. Upload real de quadro técnico.
7. Dados extraídos e validação.
8. Unidades autônomas.
9. Memorial, seções e aprovações.
10. Modelos e cláusulas.
11. Exportações e histórico.
12. Configurações.

### Telas a Conectar Primeiro

1. `/login` ou rota equivalente de autenticação.
2. `/_app` para proteção de sessão e perfil real.
3. `/` dashboard.
4. `/empreendimentos`.
5. `/empreendimentos/novo`.
6. `/empreendimentos/$id` aba Visão Geral.

## 8. Plano de Testes

### Build e Qualidade

- `pnpm build`
- `pnpm lint`
- Typecheck via `tsc --noEmit` se script for adicionado.
- Verificação de imports e rotas TanStack.

### Fluxos Principais

- Login/logout.
- Recuperação de senha.
- Listagem de empreendimentos.
- Criação de empreendimento.
- Edição de dados cadastrais.
- Upload de quadro técnico.
- Validação de dados extraídos.
- Edição e validação de unidade.
- Geração de memorial.
- Aprovação de seção.
- Exportação de revisão e final.
- Histórico/auditoria.

### CRUD Real

- Empreendimentos.
- Incorporadoras.
- Representantes legais.
- Imóveis/confrontações.
- Unidades autônomas.
- Cláusulas/modelos.
- Seções de memorial.
- Pendências.

### Autenticação, RLS e Permissões

- Usuário sem login não acessa rotas internas.
- Usuário de uma organização não lê dados de outra.
- Revisora não executa ações administrativas.
- Gestora não altera dados técnicos se a regra de permissão bloquear.
- Auditoria não pode ser alterada pelo client.
- Storage não permite download de arquivos de outra organização.

### Integrações

- Supabase Auth.
- Supabase Database.
- Supabase Storage.
- Edge Functions.
- Cloudflare deploy, se mantido como destino.

### Testes Manuais Importantes

- Navegação completa por teclado nas telas principais.
- Responsividade mínima em tablet.
- Estados de loading, erro e vazio.
- Exportação bloqueada com pendências.
- Fluxo do Residencial Madrid do cadastro à exportação.
- Conferência visual da identidade Projetse.

## 9. Preparação para Lançamento

### Revisão de Build

- Rodar `pnpm install` em ambiente limpo.
- Rodar `pnpm lint`.
- Rodar `pnpm build`.
- Validar preview/deploy em ambiente de staging.

### Revisão de Variáveis de Ambiente

- Conferir `VITE_SUPABASE_URL`.
- Conferir `VITE_SUPABASE_ANON_KEY`.
- Conferir secrets de Edge Functions.
- Conferir secrets do Cloudflare/Wrangler, se aplicável.
- Garantir ausência de secrets no repositório.

### Testes Finais

- Teste completo com usuário admin.
- Teste completo com responsável técnica.
- Teste completo com revisora.
- Teste de RLS entre organizações.
- Teste de upload/download de Storage.
- Teste de exportação.
- Teste de rollback.

### Deploy

- Aplicar migrations no ambiente de produção.
- Validar seeds mínimos, se aplicável.
- Deploy do frontend.
- Deploy das Edge Functions.
- Validar CORS e URLs públicas.

### Checklist de Go-Live

- Banco com RLS habilitado.
- Buckets privados com policies.
- Usuários reais criados.
- Domínio/URL final validado.
- Logs monitorados.
- Backup/rollback definidos.
- Equipe Projetse orientada sobre escopo funcional.

### Plano de Rollback Simples

- Manter versão anterior do frontend disponível para redeploy.
- Migrations destrutivas devem ser evitadas; quando necessárias, criar scripts reversíveis.
- Antes de mudanças críticas, exportar backup do schema/dados.
- Edge Functions devem ser versionadas por deploy.
- Em falha grave, pausar novas operações, restaurar frontend anterior e reverter migration segura.

## 10. Controle de Execução

| Data | Epic | Ação realizada | Arquivos alterados | Status | Observações |
| ---- | ---- | -------------- | ------------------ | ------ | ----------- |
| 2026-06-10 | Planejamento | Criação inicial do plano técnico para migração de protótipo Lovable para produto funcional com Supabase obrigatório. | `docs/plano-implementacao.md` | Concluído | Documento criado antes de implementar funcionalidades. |
| 2026-06-10 | Planejamento | Definição do schema oficial `projetse` para todas as alterações de banco de dados. | `docs/plano-implementacao.md` | Concluído | Tabelas, referências, migrations, RLS, views, triggers e funções SQL de negócio devem usar o schema `projetse`; `public` não deve receber tabelas de negócio. |

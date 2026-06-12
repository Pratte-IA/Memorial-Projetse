PRD — UX do Sistema de Automação do Memorial de Incorporação Projetse

1. Contexto do produto

A Projetse é uma empresa de engenharia e arquitetura que realiza a elaboração de memoriais de incorporação. Hoje, o processo parte do projeto arquitetônico do empreendimento, passa pela criação dos quadros técnicos/NBR 12.721 e, a partir desses quadros, é elaborado manualmente o Memorial de Incorporação.

O objetivo deste sistema é automatizar a experiência de geração do Memorial de Incorporação a partir dos quadros técnicos já produzidos pela Projetse, reduzindo tempo operacional, padronizando a redação documental e diminuindo risco de erro manual.

Neste momento, o foco do projeto no Lovable é desenvolver somente a UX/UI do sistema, sem integração com banco de dados, sem autenticação real, sem upload real e sem geração real de documentos. Todas as informações devem ser simuladas com dados mockados, estados locais e interações visuais.

O sistema deve parecer uma plataforma técnica, segura, elegante e profissional, alinhada à identidade visual da Projetse.

2. Objetivo da UX

Criar uma interface web para que a equipe da Projetse consiga visualizar, validar e revisar o fluxo completo de geração de um Memorial de Incorporação.

A experiência deve comunicar que o sistema funciona como uma esteira técnica de automação documental, e não como um simples chatbot ou editor de texto.

O usuário deve sentir que:

O processo está sob controle.

Os dados do quadro técnico estão organizados.

O memorial será gerado com base em dados validados.

A revisão humana continua no centro do processo.

O sistema reduz retrabalho sem tirar a responsabilidade técnica da equipe.

3. Escopo desta entrega

Esta entrega deve contemplar apenas a camada visual e de experiência do usuário.

Incluir

Dashboard de empreendimentos.

Criação visual de novo empreendimento.

Página de detalhe do empreendimento.

Fluxo de upload simulado do quadro técnico.

Tela de dados extraídos.

Tela de validação dos dados.

Tabela de unidades autônomas.

Tela de geração e revisão do memorial.

Tela de exportações.

Tela de histórico/versionamento.

Área de modelos de documento.

Biblioteca de cláusulas.

Configurações básicas visuais.

Dados mockados.

Estados visuais de progresso, erro, pendência, aprovado e exportado.

Não incluir

Banco de dados.

Supabase.

API real.

Autenticação real.

Upload real de arquivos.

Leitura real de PDF.

IA real.

Geração real de DOCX/PDF.

Backend.

Webhooks.

Integrações externas.

4. Identidade visual

A interface deve seguir a identidade visual da Projetse, com estética técnica, moderna, limpa e sofisticada.

A marca da Projetse tem como base o conceito de unir arte e ciência para entregar projetos completos, viáveis e rentáveis. O sistema deve traduzir isso em uma experiência digital precisa, organizada e confiável. A identidade também utiliza o conceito do símbolo π/Pi, ligado à matemática, geometria, engenharia, tecnologia e constância.

4.1 Paleta de cores

A identidade visual do sistema deve seguir a paleta oficial da Projetse, utilizando uma base sóbria, técnica e elegante, com predominância de preto, cinzas, branco e verdes institucionais.

As cores principais da marca são: Preto #222222, Brita #404040, Cinza #828282, Inox #A5A5A5, Concreto #CFCFCF, Branco #FFFFFF, Verde Escuro #1E3425, Verde #2B4A36, Verde Claro #4F805C e Verde de Apoio #7DAD89.

No sistema, o Branco e o Concreto devem ser utilizados como base da interface, garantindo clareza e boa leitura. O Preto e o Brita devem ser usados para textos principais, títulos e áreas de maior contraste. Os tons de Cinza, Inox e Concreto devem apoiar divisórias, bordas, labels, fundos neutros e informações secundárias.

O Verde Escuro deve ser utilizado como cor institucional de maior presença, especialmente em sidebar, header, áreas de navegação e blocos de destaque. O Verde e o Verde Claro devem ser aplicados em botões principais, indicadores positivos, status de validação, aprovações e elementos de confirmação.

As cores de apoio são Céu #3EA3DC, Alerta #E40521 e Atenção #FDC41F. A cor Céu pode ser usada para informações auxiliares, links e destaques secundários. A cor Alerta deve ser reservada para erros críticos, inconsistências importantes ou pendências que impedem a finalização do documento. A cor Atenção deve ser usada para avisos, campos pendentes, baixa confiança na extração de dados e situações que exigem conferência do usuário.

A aplicação das cores deve ser discreta e funcional. O sistema não deve parecer colorido ou promocional. A paleta precisa reforçar a sensação de precisão, engenharia, documentação e segurança, mantendo a sofisticação visual da marca Projetse.

4.2 Tipografia

A tipografia principal do sistema deve ser a fonte Sora, conforme definido no manual de identidade visual da Projetse.

A Sora deve ser utilizada em toda a interface por ser uma fonte sem serifa, contemporânea, objetiva e de excelente legibilidade. Ela comunica clareza, modernidade e precisão, características essenciais para um sistema técnico de geração documental.

Os títulos principais devem utilizar Sora SemiBold, preferencialmente com boa hierarquia visual e, quando fizer sentido, em caixa alta para reforçar o padrão institucional da marca. Os títulos de seção devem utilizar Sora Medium, mantendo contraste suficiente em relação aos textos comuns sem exagerar no peso visual.

Menus, botões, abas e labels devem utilizar Sora Medium, garantindo leitura rápida e aparência técnica. Textos corridos, descrições, campos de formulário e conteúdos explicativos devem utilizar Sora Regular. Em tabelas, dados técnicos e informações numéricas, a Sora Regular ou Medium deve ser aplicada com espaçamento adequado para facilitar a conferência.

A interface deve priorizar alinhamento à esquerda, boa entrelinha e comprimento de linha equilibrado. Como o sistema terá muitas informações técnicas, tabelas e textos longos de memorial, a legibilidade deve ser tratada como prioridade de design.

5. Persona principal

Usuária técnica responsável pela elaboração do memorial

É a pessoa que hoje recebe os quadros técnicos e transforma essas informações no Memorial de Incorporação.

Ela conhece o padrão da Projetse, entende os documentos, sabe revisar áreas, unidades, vagas, frações e confrontações, mas perde muito tempo fazendo trabalho repetitivo de cópia, adaptação e conferência.

Dores

Perde muito tempo montando documentos longos.

Precisa copiar muitos dados técnicos manualmente.

Corre risco de errar áreas, frações, unidades ou vagas.

Depende de modelos antigos.

Precisa conferir muitas informações repetidas.

Necessidades

Visualizar dados de forma organizada.

Conferir o que veio do quadro técnico.

Editar informações antes da geração do memorial.

Revisar o documento por seções.

Aprovar o memorial antes da exportação.

Ter clareza do que está pendente.

6. Usuários secundários

Revisora técnica

Precisa validar se o documento está coerente com o quadro técnico, com o projeto e com o padrão da Projetse.

Deve ter acesso a telas de conferência, alertas de inconsistência, comparação de dados e aprovação de seções.

Gestora da Projetse

Precisa acompanhar andamento dos memoriais, produtividade, status dos empreendimentos e gargalos do processo.

Deve visualizar dashboard, lista de empreendimentos, status, pendências e histórico.

7. Estrutura geral do sistema

O sistema deve ter uma navegação lateral fixa, clara e objetiva.

Menu lateral

Dashboard

Empreendimentos

Modelos de Documento

Biblioteca de Cláusulas

Histórico

Configurações

Header

Nome da tela atual.

Breadcrumb quando necessário.

Botão principal contextual.

Perfil fictício do usuário.

Notificações/pendências simuladas.

8. Fluxo principal do produto

O fluxo principal deve seguir esta lógica:

Criar empreendimento.

Fazer upload simulado do quadro técnico.

Extrair dados simulados.

Validar dados extraídos.

Revisar unidades autônomas.

Gerar memorial.

Revisar memorial por seções.

Aprovar memorial.

Exportar versão final.

Registrar histórico.

O fluxo deve ser apresentado como uma jornada clara, com status visual e progresso.

9. Dashboard

Objetivo

Dar uma visão rápida dos empreendimentos e memoriais em andamento.

Elementos da tela

Cards de indicadores:

Total de empreendimentos.

Em validação.

Memoriais gerados.

Pendentes de revisão.

Aprovados.

Exportados.

Lista/tabela de empreendimentos recentes:

Empreendimento.

Incorporadora.

Cidade/UF.

Status.

Responsável.

Última atualização.

Ação para abrir.

Status possíveis

Rascunho.

Quadro enviado.

Dados extraídos.

Em validação.

Pronto para gerar.

Memorial gerado.

Em revisão.

Aprovado.

Exportado.

Dados mockados sugeridos

Residencial Madrid — Pitangueiras SPE LTDA — Cascavel/PR — Em revisão.

Residencial Aurora — Aurora Incorporações — Toledo/PR — Dados extraídos.

Edifício Piemonte — Piemonte SPE — Cascavel/PR — Pronto para gerar.

10. Tela de empreendimentos

Objetivo

Listar todos os empreendimentos cadastrados no sistema.

Elementos

Botão “Novo empreendimento”.

Filtros por status.

Filtro por cidade.

Busca por nome do empreendimento ou incorporadora.

Tabela com empreendimentos.

Cards ou lista em visual técnico.

Ações

Abrir empreendimento.

Editar informações básicas.

Visualizar status.

Ver pendências.

11. Novo empreendimento

Objetivo

Criar visualmente um novo empreendimento.

Campos

Nome do empreendimento.

Incorporadora.

CNPJ.

Representante legal.

Cidade.

UF.

Endereço.

Lote.

Quadra.

Matrícula.

Responsável interno.

Observações.

Observação importante

Como esta etapa é apenas UX, ao salvar, o sistema deve redirecionar para a página de detalhe do empreendimento com dados mockados/local state.

12. Página de detalhe do empreendimento

Esta é a tela central do sistema.

Cabeçalho

Nome do empreendimento.

Incorporadora.

Cidade/UF.

Status atual.

Botão “Gerar memorial”.

Botão “Exportar”.

Indicador de pendências.

Indicador de progresso.

Abas internas

Visão Geral.

Quadro Técnico.

Dados Extraídos.

Unidades Autônomas.

Memorial.

Exportações.

Histórico.

13. Aba Visão Geral

Objetivo

Mostrar um resumo executivo do empreendimento.

Blocos

Dados gerais:

Nome.

Endereço.

Lote.

Quadra.

Matrícula.

Cidade/UF.

Área do terreno.

Dados técnicos:

Número do alvará.

Data de aprovação.

Responsável técnico.

CREA/CAU.

ART/RRT.

Resumo do condomínio:

Quantidade de torres.

Quantidade de pavimentos.

Quantidade de unidades.

Quantidade de vagas.

Área privativa total.

Área comum total.

Área global.

Pendências:

Campos obrigatórios faltantes.

Unidades incompletas.

Seções não revisadas.

Alertas de inconsistência.

Exemplo com dados mockados

Empreendimento: Residencial Madrid.

Cidade: Cascavel/PR.

Área do terreno: 2.763,00 m².

Área global: 3.113,58 m².

Quantidade de unidades: 60.

Quantidade de vagas: 60.

Torres: 3.

Pavimentos: 5.

O exemplo real do quadro técnico traz dados como Residencial Madrid, Pitangueiras SPE LTDA, 60 unidades, 60 vagas, área do terreno de 2.763 m² e área global de 3.113,58 m².

14. Aba Quadro Técnico

Objetivo

Simular o upload e processamento do quadro técnico/NBR 12.721.

Layout

Área de upload com drag and drop.

Card do arquivo enviado.

Status da extração.

Preview visual do PDF simulado.

Botão “Extrair dados”.

Estados visuais

Nenhum arquivo enviado.

Arquivo enviado.

Extração em andamento.

Extração concluída.

Extração com pendências.

Interação esperada

Ao clicar em “Extrair dados”, mostrar loading com etapas simuladas:

Lendo arquivo.

Identificando tabelas.

Extraindo dados do empreendimento.

Extraindo unidades.

Conferindo áreas.

Extração concluída.

Depois, liberar botão “Revisar dados extraídos”.

15. Aba Dados Extraídos

Objetivo

Permitir revisão visual dos dados extraídos do quadro técnico.

Layout recomendado

Duas colunas:

Coluna esquerda: formulário editável com os dados.

Coluna direita: preview/fonte simulada do quadro técnico.

Blocos de dados

Empreendimento.

Incorporadora.

Representante legal.

Endereço.

Terreno.

Projeto e alvará.

Responsáveis técnicos.

Áreas gerais.

Pavimentos.

Vagas.

Observações.

Status por campo

Confirmado.

Extraído automaticamente.

Editado manualmente.

Baixa confiança.

Pendente.

Recursos visuais

Badge de confiança.

Ícone de alerta.

Botão “Confirmar bloco”.

Botão “Marcar como revisado”.

Barra de progresso de validação.

16. Aba Unidades Autônomas

Objetivo

Conferir e validar todas as unidades que serão descritas no Memorial de Incorporação.

Esta é uma das telas mais importantes do sistema, porque as unidades geram uma das partes mais longas e repetitivas do memorial.

No memorial de exemplo, cada unidade recebe uma descrição individual com pavimento, torre, área construída total, área privativa, área comum, área de terreno exclusiva, fração territorial, confrontações e vaga.

Elementos

Filtros:

Torre.

Pavimento.

Tipo.

Status.

Inconsistências.

Tabela de unidades:

Unidade.

Torre.

Pavimento.

Tipo.

Área privativa.

Área comum.

Área total.

Garden.

Vaga.

Fração.

Status.

Ações

Editar unidade.

Validar unidade.

Marcar pendência.

Visualizar texto gerado.

Duplicar padrão.

Edição em massa.

Exemplo de dados mockados

Apartamento Garden 01 — Torre 01 — Térreo — Garden — 43,30 m² privativa — 8,593 m² comum — 51,893 m² total — Validado.

Apartamento 101 — Torre 01 — 1º Pavimento — Tipo — 43,30 m² privativa — 8,593 m² comum — 51,893 m² total — Pendente.

Apartamento 202 — Torre 02 — 2º Pavimento — Tipo — 43,30 m² privativa — 8,593 m² comum — 51,893 m² total — Validado.

17. Modal ou painel de edição da unidade

Objetivo

Permitir revisar uma unidade específica.

Campos

Nome/número da unidade.

Torre.

Pavimento.

Tipo.

Posição na torre.

Área privativa.

Área comum.

Área total.

Área de garden.

Área de garagem.

Fração territorial.

Vaga vinculada.

Confrontações.

Observações.

Recurso importante

Mostrar um preview do texto que será gerado para aquela unidade.

Exemplo visual:

“APARTAMENTO 101, localizar-se-á no 1º Pavimento da Torre 01 do Residencial Madrid...”

18. Aba Memorial

Objetivo

Permitir gerar, revisar e aprovar o Memorial de Incorporação.

Layout recomendado

Três colunas:

Coluna esquerda: sumário/seções do memorial.

Coluna central: editor/preview do documento.

Coluna direita: painel de dados usados na seção selecionada.

Seções do memorial

Qualificação da incorporadora.

Da Propriedade e Localização do Imóvel.

Da Incorporação Imobiliária.

Da Composição do Condomínio.

Da Aprovação do Projeto Arquitetônico.

Da Descrição das Unidades Autônomas.

Memorial Descritivo do Empreendimento.

Convenção Condominial.

Regimento Interno.

Encerramento e Assinaturas.

Status por seção

Não gerada.

Gerada.

Em revisão.

Com pendência.

Aprovada.

Ações

Gerar memorial completo.

Regenerar seção.

Editar texto.

Aprovar seção.

Marcar pendência.

Visualizar variáveis usadas.

Comparar com dados extraídos.

Salvar versão.

Editor

O editor deve parecer um documento técnico, com boa leitura, margens, título, seções e texto corrido.

Não precisa ser um editor real complexo. Pode ser uma área visual editável ou simulada com blocos de texto.

19. Painel de dados do memorial

Quando o usuário selecionar uma seção, o painel lateral direito deve mostrar os dados relacionados.

Exemplo

Se a seção for “Da Composição do Condomínio”, mostrar:

Área total edificada.

Quantidade de torres.

Quantidade de pavimentos.

Quantidade de unidades.

Quantidade de vagas.

Área privativa total.

Área comum total.

Se a seção for uma unidade, mostrar:

Nome da unidade.

Torre.

Pavimento.

Área privativa.

Área comum.

Área total.

Fração.

Vaga.

Confrontações.

20. Aba Exportações

Objetivo

Simular exportações do documento final.

Elementos

Card “Versão de revisão”.

Card “Versão final”.

Botão “Exportar DOCX”.

Botão “Exportar PDF”.

Lista de arquivos exportados simulados.

Data da exportação.

Usuário responsável.

Status da versão.

Estados

Pronto para exportar.

Exportação bloqueada por pendências.

Exportado com sucesso.

Observação

Não gerar arquivo real. Apenas simular visualmente a exportação e mostrar um toast de sucesso.

21. Aba Histórico

Objetivo

Mostrar rastreabilidade do processo.

Eventos mockados

Empreendimento criado.

Quadro técnico enviado.

Dados extraídos.

Campo editado.

Unidade validada.

Memorial gerado.

Seção aprovada.

Versão exportada.

Layout

Timeline vertical com data, horário, usuário e descrição.

Exemplo:

15/04/2026 — 09:12 — Ana Técnica enviou o quadro técnico.

15/04/2026 — 09:18 — Sistema extraiu 60 unidades.

15/04/2026 — 10:05 — Francieli aprovou a seção “Composição do Condomínio”.

22. Tela Modelos de Documento

Objetivo

Permitir visualizar modelos utilizados para gerar memoriais.

Elementos

Lista de modelos.

Nome do modelo.

Tipo.

Status.

Última atualização.

Botão “Visualizar modelo”.

Modelos mockados

Memorial de Incorporação — Padrão Projetse.

Descrição de Unidade Garden.

Descrição de Unidade Tipo.

Cláusula de Incorporação Imobiliária.

Cláusula de Aprovação do Projeto.

Convenção Condominial Padrão.

Regimento Interno Padrão.

Observação

Esta tela deve ser apenas visual. Não precisa salvar modelos reais.

23. Tela Biblioteca de Cláusulas

Objetivo

Simular uma biblioteca de textos padrão da Projetse.

Elementos

Busca.

Filtro por categoria.

Lista de cláusulas.

Preview da cláusula.

Status.

Categorias

Incorporação.

Propriedade e Localização.

Composição do Condomínio.

Aprovação de Projeto.

Unidades Autônomas.

Memorial Descritivo.

Convenção Condominial.

Regimento Interno.

24. Configurações

Objetivo

Tela simples para simular configurações do sistema.

Seções

Dados da Projetse.

Identidade visual.

Usuários e permissões.

Preferências de exportação.

Status do sistema.

Observação

Tudo deve ser visual/mockado.

25. Componentes obrigatórios de UX

O sistema deve conter:

Sidebar fixa.

Header contextual.

Cards de métricas.

Tabelas técnicas.

Badges de status.

Stepper/progresso do processo.

Timeline de histórico.

Área de upload simulada.

Preview de PDF simulado.

Formulários editáveis.

Painel lateral de dados.

Editor visual do memorial.

Toasts de sucesso/erro.

Skeleton/loading states.

Estados vazios bem desenhados.

Alertas de inconsistência.

Botões primários e secundários.

26. Tom da interface

A interface deve ser técnica, clara e segura.

Evitar linguagem exageradamente informal.

Evitar termos genéricos como “documento mágico” ou “IA criou tudo”.

Preferir termos como:

Dados extraídos.

Validação técnica.

Gerar memorial.

Revisar seção.

Aprovar seção.

Pendências encontradas.

Inconsistências.

Exportar versão final.

Histórico de alterações.



28. Dados mockados principais

Usar como empreendimento principal:

Nome: Residencial Madrid.

Incorporadora: Pitangueiras SPE LTDA.

CNPJ: 63.310.140/0001-86.

Cidade: Cascavel/PR.

Endereço: Rua Ilhas Canárias, nº 359.

Lote: 13.

Quadra: 04.

Área do terreno: 2.763,00 m².

Área global: 3.113,58 m².

Quantidade de torres: 3.

Quantidade de pavimentos: 5.

Quantidade de unidades: 60.

Quantidade de vagas: 60.

Responsável técnico: Francieli Luize Wagner Lima.

CREA: 158.605 D/PR.

Status: Em revisão.

Esses dados estão alinhados aos documentos de exemplo analisados, nos quais o quadro técnico apresenta o Residencial Madrid, com 60 unidades, 60 vagas e área global de 3.113,58 m².

29. Requisitos de responsividade

Priorizar desktop.

O sistema será usado principalmente em notebook ou monitor, pois envolve leitura de tabelas, PDFs e documentos longos.

Ainda assim, deve ter adaptação mínima para tablet.

Mobile não é prioridade nesta etapa.

30. Critérios de aceite

A entrega será considerada boa se:

O sistema parecer uma plataforma técnica real da Projetse.

A navegação estiver clara.

O fluxo do memorial estiver fácil de entender.

As telas principais estiverem conectadas visualmente.

Os dados mockados forem consistentes.

A identidade visual estiver alinhada à marca.

O usuário conseguir entender o processo completo sem backend.

A tela de unidades for forte e bem organizada.

A tela de memorial parecer um ambiente de revisão documental.

A IA não aparecer como chatbot principal, mas como apoio ao processo.

A interface transmitir segurança, organização e precisão.

31. Direção visual final

Criar uma interface elegante, técnica e minimalista, com fundo claro, sidebar escura em verde escuro ou preto, tipografia Sora, cards bem espaçados, tabelas legíveis e status visuais discretos.

O sistema deve parecer uma ferramenta premium de engenharia documental.

Evitar excesso de cores, excesso de ícones e layouts genéricos.

A experiência precisa traduzir a essência da Projetse:

Arte na clareza da interface.

Ciência na precisão dos dados.

Controle na geração do memorial.

Segurança na revisão técnica.


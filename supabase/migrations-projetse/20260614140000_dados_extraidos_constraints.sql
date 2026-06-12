-- EPIC-07: constraints e índice único para dados extraídos

alter table projetse.dados_extraidos
  drop constraint if exists dados_extraidos_confianca_range;

alter table projetse.dados_extraidos
  add constraint dados_extraidos_confianca_range
  check (confianca is null or (confianca >= 0 and confianca <= 100));

create unique index if not exists dados_extraidos_emp_bloco_campo_uidx
  on projetse.dados_extraidos (empreendimento_id, bloco, campo);

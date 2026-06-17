-- Permite upload de DOCX (OOXML) no bucket documentos-exportados.
-- O gerador client-side envia application/vnd.openxmlformats-officedocument.wordprocessingml.document.

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'application/rtf',
  'application/vnd.ms-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]
where id = 'documentos-exportados';

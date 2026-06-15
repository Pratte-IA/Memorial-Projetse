-- Permite upload de planilhas CFMD (.xlsx, .xls, .csv) no bucket de quadros técnicos.

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
]
where id = 'quadros-tecnicos';

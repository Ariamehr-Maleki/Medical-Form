create extension if not exists pgcrypto;

create table public.medical_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  schema_version integer not null default 1 check (schema_version = 1),
  source text not null default 'manual' check (source in ('manual', 'csv_upload')),
  original_filename text,
  row_count integer not null default 1 check (row_count > 0),
  csv_content text not null check (octet_length(csv_content) <= 1000000),
  csv_sha256 text not null check (csv_sha256 ~ '^[0-9a-f]{64}$'),
  normalized_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.medical_submissions
  add constraint medical_submissions_checksum_matches_content
    check (csv_sha256 = encode(digest(convert_to(csv_content, 'UTF8'), 'sha256'), 'hex')),
  add constraint medical_submissions_normalized_shape
    check (
      normalized_data ?& array['name','age','gender','bloodType','medicalCondition','admissionDate','doctor','hospital','insuranceProvider','billingAmount']
      and normalized_data - array['name','age','gender','bloodType','medicalCondition','admissionDate','doctor','hospital','insuranceProvider','billingAmount'] = '{}'::jsonb
      and jsonb_typeof(normalized_data->'age') = 'number'
      and (normalized_data->>'age')::numeric = trunc((normalized_data->>'age')::numeric)
      and (normalized_data->>'age')::numeric between 0 and 120
      and normalized_data->>'gender' in ('Male','Female','Other','Prefer not to say')
      and normalized_data->>'bloodType' in ('A+','A-','B+','B-','AB+','AB-','O+','O-')
      and normalized_data->>'admissionDate' ~ '^\d{4}-\d{2}-\d{2}$'
      and to_char(to_date(normalized_data->>'admissionDate','YYYY-MM-DD'),'YYYY-MM-DD') = normalized_data->>'admissionDate'
      and normalized_data->>'billingAmount' ~ '^\d+(\.\d{2})$'
      and (normalized_data->>'billingAmount')::numeric between 0 and 10000000
      and char_length(normalized_data->>'name') between 2 and 100
      and char_length(normalized_data->>'medicalCondition') between 2 and 100
      and char_length(normalized_data->>'doctor') between 2 and 100
      and char_length(normalized_data->>'hospital') between 2 and 150
      and char_length(normalized_data->>'insuranceProvider') between 2 and 100
    ),
  add constraint medical_submissions_manual_single_row check (source <> 'manual' or row_count = 1);
create index medical_submissions_user_created_idx on public.medical_submissions (user_id, created_at desc);
create unique index medical_submissions_user_checksum_idx on public.medical_submissions (user_id, csv_sha256);
alter table public.medical_submissions enable row level security;
alter table public.medical_submissions force row level security;

create policy "Users insert own submissions" on public.medical_submissions for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users select own submissions" on public.medical_submissions for select to authenticated using (user_id = (select auth.uid()));
create policy "Users delete own submissions" on public.medical_submissions for delete to authenticated using (user_id = (select auth.uid()));

grant select, insert, delete on public.medical_submissions to authenticated;
revoke all on public.medical_submissions from anon;

comment on table public.medical_submissions is 'PulseVault interview-demo submissions. Not approved for clinical use.';

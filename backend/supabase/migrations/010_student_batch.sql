-- Migration: 010_student_batch.sql
-- Add batch column to public.profiles and backfill from student email addresses

alter table public.profiles add column if not exists batch text;

-- Check constraint ensuring batch is populated appropriately for students
alter table public.profiles drop constraint if exists profiles_student_batch_check;
alter table public.profiles add constraint profiles_student_batch_check check (
  (user_type = 'STUDENT' and (batch is null or batch ~ '^\d{4}$'))
  or (user_type <> 'STUDENT' and batch is null)
);

-- Backfill batch for existing student profiles
update public.profiles
set batch = case
  when email ~* '^u([0-9]{2})[0-9]{5}@' then
    case
      when (substring(lower(email) from '^u([0-9]{2})')::int) >= 50
      then '19' || substring(lower(email) from '^u([0-9]{2})')
      else '20' || substring(lower(email) from '^u([0-9]{2})')
    end
  else null
end
where user_type = 'STUDENT' and batch is null;

-- Index for batch lookups
create index if not exists profiles_batch_idx on public.profiles (batch) where batch is not null;

notify pgrst, 'reload schema';

-- Smart Healthcare Management System
-- Canonical Supabase PostgreSQL schema
--
-- Admin authorization requires this JWT claim:
-- auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
--
-- Service-role credentials must only be used by trusted backend services.
-- They must never be exposed to frontend clients.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_code text NOT NULL UNIQUE,
  full_name text NOT NULL,
  date_of_birth date,
  gender text,
  phone text,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.doctors (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_code text NOT NULL UNIQUE,
  full_name text NOT NULL,
  specialization text,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL
    REFERENCES public.patients(id)
    ON DELETE CASCADE,
  doctor_id uuid NOT NULL
    REFERENCES public.doctors(id)
    ON DELETE RESTRICT,
  diagnosis text,
  symptoms text,
  treatment text,
  notes text,
  visit_date timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL
    REFERENCES public.patients(id)
    ON DELETE CASCADE,
  uploaded_by uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE RESTRICT,
  file_name text NOT NULL,
  file_type text,
  document_type text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_size bigint CHECK (file_size IS NULL OR file_size >= 0),
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (
      status IN (
        'PENDING',
        'PROCESSING',
        'COMPLETED',
        'FAILED',
        'DELETED'
      )
    ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.extracted_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL
    REFERENCES public.documents(id)
    ON DELETE CASCADE,
  extracted_text text,
  data_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid
    REFERENCES auth.users(id)
    ON DELETE SET NULL,
  patient_id uuid
    REFERENCES public.patients(id)
    ON DELETE SET NULL,
  document_id uuid
    REFERENCES public.documents(id)
    ON DELETE SET NULL,
  action text NOT NULL
    CHECK (
      action IN (
        'UPLOAD',
        'VIEW',
        'DELETE',
        'MIGRATION'
      )
    ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  destination text NOT NULL,
  total_records integer NOT NULL DEFAULT 0
    CHECK (total_records >= 0),
  successful_records integer NOT NULL DEFAULT 0
    CHECK (successful_records >= 0),
  failed_records integer NOT NULL DEFAULT 0
    CHECK (failed_records >= 0),
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (
      status IN (
        'PENDING',
        'RUNNING',
        'COMPLETED',
        'FAILED'
      )
    ),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS patients_patient_code_idx
  ON public.patients(patient_code);

CREATE INDEX IF NOT EXISTS medical_records_patient_id_idx
  ON public.medical_records(patient_id);

CREATE INDEX IF NOT EXISTS medical_records_doctor_id_idx
  ON public.medical_records(doctor_id);

CREATE INDEX IF NOT EXISTS medical_records_visit_date_idx
  ON public.medical_records(visit_date);

CREATE INDEX IF NOT EXISTS documents_patient_id_idx
  ON public.documents(patient_id);

CREATE INDEX IF NOT EXISTS documents_document_type_idx
  ON public.documents(document_type);

CREATE INDEX IF NOT EXISTS documents_status_idx
  ON public.documents(status);

CREATE INDEX IF NOT EXISTS documents_created_at_idx
  ON public.documents(created_at);

CREATE INDEX IF NOT EXISTS extracted_data_document_id_idx
  ON public.extracted_data(document_id);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx
  ON public.audit_logs(user_id);

CREATE INDEX IF NOT EXISTS audit_logs_patient_id_idx
  ON public.audit_logs(patient_id);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx
  ON public.audit_logs(created_at);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migrations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Grants
-- ============================================================

GRANT SELECT, INSERT, UPDATE
  ON public.patients
  TO authenticated;

GRANT SELECT, INSERT, UPDATE
  ON public.doctors
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.medical_records
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.documents
  TO authenticated;

GRANT SELECT
  ON public.extracted_data
  TO authenticated;

GRANT SELECT
  ON public.audit_logs
  TO authenticated;

GRANT SELECT, INSERT, UPDATE
  ON public.migrations
  TO authenticated;

GRANT ALL
  ON public.patients,
     public.doctors,
     public.medical_records,
     public.documents,
     public.extracted_data,
     public.audit_logs,
     public.migrations
  TO service_role;

-- ============================================================
-- Patients RLS policies
-- ============================================================

CREATE POLICY "patients_authorized_read"
ON public.patients
FOR SELECT
TO authenticated
USING (
  id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "patients_self_insert"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (
  id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "patients_self_update"
ON public.patients
FOR UPDATE
TO authenticated
USING (
  id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ============================================================
-- Doctors RLS policies
-- ============================================================

CREATE POLICY "doctors_authorized_read"
ON public.doctors
FOR SELECT
TO authenticated
USING (
  id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "doctors_self_insert"
ON public.doctors
FOR INSERT
TO authenticated
WITH CHECK (
  id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "doctors_self_update"
ON public.doctors
FOR UPDATE
TO authenticated
USING (
  id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ============================================================
-- Medical records RLS policies
-- ============================================================

CREATE POLICY "medical_records_authorized_read"
ON public.medical_records
FOR SELECT
TO authenticated
USING (
  patient_id = (SELECT auth.uid())
  OR doctor_id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "medical_records_authorized_insert"
ON public.medical_records
FOR INSERT
TO authenticated
WITH CHECK (
  (
    doctor_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.patients AS p
      WHERE p.id = patient_id
    )
  )
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "medical_records_authorized_update"
ON public.medical_records
FOR UPDATE
TO authenticated
USING (
  doctor_id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  doctor_id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "medical_records_authorized_delete"
ON public.medical_records
FOR DELETE
TO authenticated
USING (
  doctor_id = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ============================================================
-- Documents RLS policies
-- ============================================================

CREATE POLICY "documents_authorized_read"
ON public.documents
FOR SELECT
TO authenticated
USING (
  patient_id = (SELECT auth.uid())
  OR uploaded_by = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.medical_records AS mr
    WHERE mr.patient_id = documents.patient_id
      AND mr.doctor_id = (SELECT auth.uid())
  )
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "documents_authorized_insert"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
  (
    uploaded_by = (SELECT auth.uid())
    AND (
      patient_id = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1
        FROM public.medical_records AS mr
        WHERE mr.patient_id = documents.patient_id
          AND mr.doctor_id = (SELECT auth.uid())
      )
    )
  )
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "documents_authorized_update"
ON public.documents
FOR UPDATE
TO authenticated
USING (
  uploaded_by = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  uploaded_by = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "documents_authorized_delete"
ON public.documents
FOR DELETE
TO authenticated
USING (
  uploaded_by = (SELECT auth.uid())
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ============================================================
-- Extracted data RLS policies
-- ============================================================

CREATE POLICY "extracted_data_authorized_read"
ON public.extracted_data
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.documents AS d
    WHERE d.id = extracted_data.document_id
  )
  OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- There are intentionally no authenticated INSERT, UPDATE, or DELETE
-- policies for extracted_data. Trusted backend processing should use
-- service_role or another protected server-side mechanism.

-- ============================================================
-- Audit log RLS policies
-- ============================================================

CREATE POLICY "audit_logs_admin_read"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- There are intentionally no authenticated INSERT, UPDATE, or DELETE
-- policies for audit_logs. Normal users cannot write arbitrary audit data.
-- Trusted backend audit operations should use service_role.

-- ============================================================
-- Migration tracking RLS policies
-- ============================================================

CREATE POLICY "migrations_admin_all"
ON public.migrations
FOR ALL
TO authenticated
USING (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ============================================================
-- Private Storage bucket
-- ============================================================

INSERT INTO storage.buckets (
  id,
  name,
  public
)
VALUES (
  'healthcare-documents',
  'healthcare-documents',
  false
)
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  public = false;

-- ============================================================
-- Storage RLS policies
-- ============================================================

CREATE POLICY "healthcare_documents_read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'healthcare-documents'
  AND storage.allow_any_operation(
    ARRAY[
      'object.list',
      'object.get_authenticated',
      'object.get_authenticated_info'
    ]
  )
  AND EXISTS (
    SELECT 1
    FROM public.documents AS d
    WHERE d.storage_path = storage.objects.name
      AND (
        d.patient_id = (SELECT auth.uid())
        OR d.uploaded_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1
          FROM public.medical_records AS mr
          WHERE mr.patient_id = d.patient_id
            AND mr.doctor_id = (SELECT auth.uid())
        )
        OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      )
  )
);

CREATE POLICY "healthcare_documents_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'healthcare-documents'
  AND (storage.foldername(name))[1] = 'patients'
  AND EXISTS (
    SELECT 1
    FROM public.documents AS d
    WHERE d.storage_path = storage.objects.name
      AND (
        d.uploaded_by = (SELECT auth.uid())
        OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      )
  )
);

CREATE POLICY "healthcare_documents_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'healthcare-documents'
  AND EXISTS (
    SELECT 1
    FROM public.documents AS d
    WHERE d.storage_path = storage.objects.name
      AND (
        d.uploaded_by = (SELECT auth.uid())
        OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      )
  )
)
WITH CHECK (
  bucket_id = 'healthcare-documents'
);

CREATE POLICY "healthcare_documents_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'healthcare-documents'
  AND EXISTS (
    SELECT 1
    FROM public.documents AS d
    WHERE d.storage_path = storage.objects.name
      AND (
        d.uploaded_by = (SELECT auth.uid())
        OR (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      )
  )
);
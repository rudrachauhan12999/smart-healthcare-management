# Database and Supabase

This directory contains the database foundation for the Smart Healthcare Management System.

## Database

The project uses:

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage

## Tables

The database contains:

- patients
- doctors
- medical_records
- documents
- extracted_data
- audit_logs
- migrations

## Storage

The Supabase Storage bucket is:

healthcare-documents

The bucket must remain private.

Documents should use a path similar to:

patients/{patient_id}/{document_id}/{file_name}

Downloads must use signed URLs.

## Authentication

Authentication is handled by Supabase Auth.

User accounts are managed by Supabase Auth and are not created by schema.sql.

Admin privileges must be assigned through a trusted server-side process.

Never store passwords in application tables.

## Row Level Security

RLS is enabled on all seven application tables.

Normal authenticated users must not be able to access unauthorized healthcare information.

Migration operations are restricted to authorized administrators.

Normal authenticated users cannot directly write audit logs.

## Migration

Legacy sample data is located at:

database/sample_legacy_patients.csv

The migration pipeline should:

1. Read legacy data.
2. Validate records.
3. Detect missing required fields.
4. Detect invalid values.
5. Detect duplicate patient codes.
6. Transform valid records.
7. Insert valid records.
8. Record migration statistics.

Migration statuses:

- PENDING
- RUNNING
- COMPLETED
- FAILED

## Security

Never commit:

- .env files
- Supabase service-role keys
- API keys
- JWT secrets
- Database passwords
- Real patient information

## Document Upload Integration

The backend must create the corresponding documents metadata row before uploading the object to Supabase Storage.

The Storage bucket is private, so downloads must use signed URLs.
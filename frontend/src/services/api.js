/**
 * Centralized API Service for Smart Healthcare Management System
 * Communicates with FastAPI backend using the agreed contract.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Custom API Error class with human-readable error mappings
 */
export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Format human-readable error messages for HTTP status codes
 */
function getErrorMessageForStatus(status, fallbackMessage) {
  switch (status) {
    case 400:
      return fallbackMessage || 'Invalid request parameters. Please verify your input.';
    case 401:
      return 'Authentication required. Please sign in to access healthcare records.';
    case 403:
      return 'Access forbidden. You do not have permission to perform this medical action.';
    case 404:
      return fallbackMessage || 'The requested healthcare record or document was not found.';
    case 500:
      return 'A medical server internal error occurred. Please contact system support.';
    default:
      return fallbackMessage || `Healthcare service error (Status ${status}).`;
  }
}

/**
 * Base fetch wrapper with standardized error handling and JSON parsing
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`;

  const defaultHeaders = {};
  // Do not set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle non-OK status codes
    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.message || '';
      } catch {
        errorDetail = await response.text().catch(() => '');
      }

      const humanMessage = getErrorMessageForStatus(response.status, errorDetail);
      throw new ApiError(response.status, humanMessage, errorDetail);
    }

    // Attempt to parse JSON response
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network / offline / connection error
    throw new ApiError(
      0,
      `Cannot connect to healthcare backend at ${API_BASE_URL}. Ensure the FastAPI server is running.`,
      error.message
    );
  }
}

/**
 * Health Check
 * GET /api/health
 * Response: { "status": "healthy" }
 */
export async function healthCheck() {
  return request('/api/health');
}

/**
 * Patients List
 * GET /api/patients
 * Response: { "patients": [] }
 */
export async function getPatients() {
  return request('/api/patients');
}

/**
 * Patient Details by ID
 * GET /api/patients/{patient_id}
 */
export async function getPatient(id) {
  if (!id) throw new Error('Patient ID is required');
  return request(`/api/patients/${encodeURIComponent(id)}`);
}

/**
 * Documents List
 * GET /api/documents
 * Response: { "documents": [] }
 */
export async function getDocuments() {
  return request('/api/documents');
}

/**
 * Single Document Details
 * GET /api/documents/{document_id}
 */
export async function getDocument(id) {
  if (!id) throw new Error('Document ID is required');
  return request(`/api/documents/${encodeURIComponent(id)}`);
}

/**
 * Upload Document
 * POST /api/documents/upload
 * multipart/form-data with fields: 'file' and 'patient_id'
 */
export async function uploadDocument(file, patientId) {
  if (!file) throw new Error('File is required for upload');
  if (!patientId) throw new Error('Patient ID is required to link document');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('patient_id', patientId);

  return request('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Search Documents
 * GET /api/search?q={query}
 * Response: { "results": [] }
 */
export async function searchDocuments(query) {
  const q = encodeURIComponent(query || '');
  return request(`/api/search?q=${q}`);
}

/**
 * Delete Document
 * DELETE /api/documents/{document_id}
 * Response: { "success": true, "message": "Document deleted successfully" }
 */
export async function deleteDocument(id) {
  if (!id) throw new Error('Document ID is required');
  return request(`/api/documents/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/**
 * Get Document Download URL
 * GET /api/documents/{document_id}/download
 * Returns signed URL
 */
export async function getDocumentDownloadUrl(id) {
  if (!id) throw new Error('Document ID is required');
  return request(`/api/documents/${encodeURIComponent(id)}/download`);
}

/**
 * Start Database / Record Migration
 * POST /api/migration/start
 * Response: { "migration_id": "uuid", "status": "COMPLETED", ... }
 */
export async function startMigration() {
  return request('/api/migration/start', {
    method: 'POST',
  });
}

export default {
  healthCheck,
  getPatients,
  getPatient,
  getDocuments,
  getDocument,
  uploadDocument,
  searchDocuments,
  deleteDocument,
  getDocumentDownloadUrl,
  startMigration,
};

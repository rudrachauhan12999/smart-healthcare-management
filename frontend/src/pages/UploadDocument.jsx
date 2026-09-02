import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  FileImage,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { getPatients, uploadDocument } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export default function UploadDocument() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const initialPatientId = searchParams.get('patient_id') || '';

  // Form states
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Uploading / progress states
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Load patients for dropdown
  useEffect(() => {
    async function loadPatients() {
      setLoadingPatients(true);
      try {
        const res = await getPatients();
        setPatients(res?.patients || []);
      } catch (err) {
        console.error('Could not load patients list:', err);
      } finally {
        setLoadingPatients(false);
      }
    }
    loadPatients();
  }, []);

  // Sync initial query param if present
  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  // File selection validation
  const handleFileChange = (file) => {
    setError(null);
    setUploadSuccess(null);

    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError({
        message: `Invalid file format: .${ext}. Only PDF, JPG, JPEG, and PNG files are supported for clinical records.`,
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError({
        message: 'File exceeds maximum limit of 25MB.',
      });
      return;
    }

    setSelectedFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Submit upload to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedPatientId) {
      setError({ message: 'Please select a patient before uploading the document.' });
      return;
    }

    if (!selectedFile) {
      setError({ message: 'Please attach a document file (PDF, JPG, PNG).' });
      return;
    }

    setUploading(true);
    setProgress(15);

    // Simulated stepped progress while upload executes
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 150);

    try {
      const response = await uploadDocument(selectedFile, selectedPatientId);
      clearInterval(interval);
      setProgress(100);

      setUploadSuccess({
        document_id: response?.document_id,
        file_name: response?.file_name || selectedFile.name,
        status: response?.status || 'PROCESSING',
      });

      // Clear input
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      clearInterval(interval);
      setError(err);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Upload Medical Document
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Attach clinical records, lab findings, or medical scans to patient charts
        </p>
      </div>

      {/* Success Notification */}
      {uploadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 shadow-2xs animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-emerald-900">
                Document Uploaded Successfully
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                File <span className="font-semibold">{uploadSuccess.file_name}</span> has been securely submitted to the FastAPI processing pipeline.
              </p>
              <div className="mt-2.5 flex items-center gap-3 text-xs">
                <span className="font-mono bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  ID: {uploadSuccess.document_id || 'uuid-registered'}
                </span>
                <span className="font-semibold text-emerald-800 uppercase tracking-wide text-[11px] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Status: {uploadSuccess.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Link
                  to="/documents"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                >
                  <span>View in Repository</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setUploadSuccess(null);
                    setProgress(0);
                  }}
                  className="text-xs font-medium text-emerald-800 hover:underline"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage
          error={error}
          onDismiss={() => setError(null)}
          title="Upload Validation / Server Error"
        />
      )}

      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6"
      >
        {/* Patient Selection Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Target Patient Chart <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <select
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
            >
              <option value="">-- Select Patient Record --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.patient_code}) — DOB: {p.date_of_birth || 'N/A'}
                </option>
              ))}
            </select>
          </div>
          {patients.length === 0 && !loadingPatients && (
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                No patients found in backend. You can manually enter a patient UUID if preferred.
              </span>
            </p>
          )}
        </div>

        {/* Drag and Drop Zone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Medical File Attachment <span className="text-rose-500">*</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            id="medical-file-input"
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-150 ${
                dragOver
                  ? 'border-blue-600 bg-blue-50/50 scale-[0.99]'
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/70'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Click to browse or drag & drop medical document
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Supported formats: <strong>PDF, JPG, JPEG, PNG</strong> (up to 25 MB).
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  .PDF
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  .JPG
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                  .PNG
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  {selectedFile.name.endsWith('.pdf') ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <FileImage className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Clinical Document'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Uploading multipart data to /api/documents/upload...</span>
              </span>
              <span className="font-mono text-slate-500">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !selectedFile || !selectedPatientId}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Upload...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Submit Medical Document</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security notice */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
        <span>
          Documents are processed through multipart encryption and dispatched to FastAPI OCR worker queues.
        </span>
      </div>
    </div>
  );
}

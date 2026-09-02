import React, { useState } from 'react';
import {
  FileText,
  FileImage,
  File,
  Eye,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
} from 'lucide-react';

export default function DocumentCard({
  document,
  onView,
  onDownload,
  onDelete,
  patientMap = {},
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!document) return null;

  const {
    id,
    file_name = 'document.pdf',
    document_type = 'medical_report',
    status = 'PROCESSING',
    created_at,
    file_size,
    patient_id,
    extracted_data,
  } = document;

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Icon based on filename
  const getFileIcon = (name) => {
    const ext = name?.split('.')?.pop()?.toLowerCase();
    if (ext === 'pdf') {
      return <FileText className="w-5 h-5 text-rose-600" />;
    }
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      return <FileImage className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-slate-600" />;
  };

  // Status pill
  const renderStatus = (s) => {
    const normalized = (s || '').toUpperCase();
    if (normalized === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    }
    if (normalized === 'PROCESSING') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <Loader2 className="w-3 h-3 animate-spin" />
          Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3" />
        {normalized || 'Failed'}
      </span>
    );
  };

  const patient = patient_id ? patientMap[patient_id] : null;

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(id);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group">
        <div>
          {/* Header with Icon and Status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              {getFileIcon(file_name)}
            </div>
            <div>{renderStatus(status)}</div>
          </div>

          {/* File Name & Type */}
          <h3
            className="text-sm font-semibold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors"
            title={file_name}
          >
            {file_name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mb-3">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono capitalize">
              {document_type?.replace(/_/g, ' ')}
            </span>
            {file_size && <span>• {formatFileSize(file_size)}</span>}
          </div>

          {/* Patient Association */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">
                {patient ? `${patient.full_name} (${patient.patient_code})` : patient_id || 'Unassigned Patient'}
              </span>
            </div>
          </div>

          {/* Meta & Extraction badge */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(created_at)}
            </span>
            {extracted_data && Object.keys(extracted_data).length > 0 && (
              <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                Data Extracted
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {onView && (
              <button
                type="button"
                onClick={() => onView(document)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="View document data"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
            )}

            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(id, file_name)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Download document"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            )}
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal before Destructive Action */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Delete Medical Document?
                </h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs break-all">
              {file_name}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

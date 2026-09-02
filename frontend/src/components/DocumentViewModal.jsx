import React from 'react';
import { X, FileText, Download, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function DocumentViewModal({
  document,
  isOpen,
  onClose,
  onDownload,
  patient,
}) {
  if (!isOpen || !document) return null;

  const {
    id,
    file_name,
    document_type,
    status,
    created_at,
    extracted_data,
  } = document;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 truncate max-w-md">
                {file_name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                ID: {id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                Type
              </span>
              <span className="text-xs font-medium text-slate-800 capitalize">
                {document_type?.replace(/_/g, ' ') || 'General'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                Status
              </span>
              <span className="text-xs font-semibold text-blue-700">
                {status || 'Unknown'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                Patient
              </span>
              <span className="text-xs font-medium text-slate-800 truncate block">
                {patient ? patient.full_name : 'Patient Attached'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                Uploaded
              </span>
              <span className="text-xs text-slate-700">
                {created_at ? new Date(created_at).toLocaleDateString() : 'Recent'}
              </span>
            </div>
          </div>

          {/* Extracted Data Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Extracted Medical Data
              </h4>
              <span className="text-xs text-slate-400">
                AI / OCR Pipeline
              </span>
            </div>

            {extracted_data && Object.keys(extracted_data).length > 0 ? (
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                <pre>{JSON.stringify(extracted_data, null, 2)}</pre>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">
                  {status === 'PROCESSING'
                    ? 'Document is currently being processed by clinical pipeline...'
                    : 'No structured extracted data available for this document.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Extracted fields (diagnoses, lab values, prescriptions) appear here once extraction finishes.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-400">
            Smart Healthcare Records
          </span>

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(id, file_name)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

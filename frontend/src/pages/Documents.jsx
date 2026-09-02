import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Files,
  UploadCloud,
  Filter,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Trash2,
  User,
} from 'lucide-react';
import { getDocuments, getPatients, getDocumentDownloadUrl, deleteDocument } from '../services/api';
import DocumentCard from '../components/DocumentCard';
import DocumentViewModal from '../components/DocumentViewModal';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Deletion confirm modal state for table view
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocumentsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, ptsRes] = await Promise.all([
        getDocuments(),
        getPatients().catch(() => ({ patients: [] })),
      ]);

      setDocuments(docsRes?.documents || []);

      const pMap = (ptsRes?.patients || []).reduce((acc, p) => {
        acc[p.id] = p;
        if (p.patient_code) acc[p.patient_code] = p;
        return acc;
      }, {});
      setPatientMap(pMap);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentsData();
  }, []);

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await getDocumentDownloadUrl(docId);
      const url = res?.download_url || res?.url || (typeof res === 'string' ? res : null);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Signed download URL generated successfully.');
      }
    } catch (err) {
      alert(`Download error: ${err.message}`);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (docToDelete?.id === docId) {
        setDocToDelete(null);
      }
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        doc.file_name?.toLowerCase().includes(q) ||
        doc.document_type?.toLowerCase().includes(q) ||
        doc.id?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (doc.status || '').toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchQuery, statusFilter]);

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Medical Documents Repository
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Diagnostic reports, lab results, scans, and AI-extracted data
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchDocumentsData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorMessage
          error={error}
          onRetry={fetchDocumentsData}
          title="Document Repository Service Notice"
        />
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filter by file name or document type..."
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {['ALL', 'COMPLETED', 'PROCESSING', 'FAILED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All' : st}
            </button>
          ))}

          {/* View Toggle */}
          <div className="hidden md:flex items-center border-l border-slate-200 pl-3 ml-1 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                viewMode === 'grid'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                viewMode === 'table'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Documents Content */}
      {loading ? (
        <Loading variant="skeleton" count={6} />
      ) : filteredDocuments.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={(d) => setSelectedDoc(d)}
                onDownload={handleDownload}
                onDelete={handleDelete}
                patientMap={patientMap}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">File Name</th>
                    <th className="px-5 py-3.5">Patient</th>
                    <th className="px-5 py-3.5">Document Type</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Upload Date</th>
                    <th className="px-5 py-3.5">File Size</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((doc) => {
                    const pt = patientMap[doc.patient_id];
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-semibold text-slate-900 truncate max-w-xs block">
                              {doc.file_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs">
                          {pt ? (
                            <Link
                              to={`/patients/${pt.id}`}
                              className="text-blue-700 hover:underline font-medium"
                            >
                              {pt.full_name} ({pt.patient_code})
                            </Link>
                          ) : (
                            <span className="text-slate-500 font-mono text-xs">
                              {doc.patient_id || 'Unassigned'}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-700 font-mono capitalize">
                          {doc.document_type?.replace(/_/g, ' ')}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium inline-block ${
                              (doc.status || '').toUpperCase() === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : (doc.status || '').toUpperCase() === 'PROCESSING'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {doc.status || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedDoc(doc)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(doc.id, doc.file_name)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Download signed URL"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDocToDelete(doc)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Files className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No documents match filter criteria'
              : 'No medical documents found in repository'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try resetting the filter or search query.'
              : 'Upload medical PDFs or imaging scans to populate this clinical repository.'}
          </p>
          <div className="mt-4">
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>
      )}

      {/* View Modal */}
      <DocumentViewModal
        document={selectedDoc}
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDownload={handleDownload}
        patient={selectedDoc ? patientMap[selectedDoc.patient_id] : null}
      />

      {/* Confirmation Modal before Table Deletion */}
      {docToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Confirm Document Deletion
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to permanently delete:
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-800 mb-5 truncate">
              {docToDelete.file_name}
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await handleDelete(docToDelete.id);
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

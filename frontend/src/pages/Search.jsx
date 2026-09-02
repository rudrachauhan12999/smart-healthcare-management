import React, { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  FileText,
  User,
  Sparkles,
  ArrowRight,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { searchDocuments, getDocumentDownloadUrl, getPatients } from '../services/api';
import SearchBar from '../components/SearchBar';
import DocumentViewModal from '../components/DocumentViewModal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const SUGGESTED_QUERIES = [
  'Chest X-Ray',
  'Cardiology',
  'Metabolic Panel',
  'Sinus Bradycardia',
  'Discharge Summary',
  'Radiology',
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientMap, setPatientMap] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Load patient map for names
  useEffect(() => {
    async function loadPts() {
      try {
        const res = await getPatients();
        const map = (res?.patients || []).reduce((acc, p) => {
          acc[p.id] = p;
          if (p.patient_code) acc[p.patient_code] = p;
          return acc;
        }, {});
        setPatientMap(map);
      } catch {
        // Soft fail
      }
    }
    loadPts();
  }, []);

  const handleSearch = async (qString) => {
    const q = (qString !== undefined ? qString : query).trim();
    if (!q) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await searchDocuments(q);
      setResults(response?.results || []);
    } catch (err) {
      setError(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await getDocumentDownloadUrl(docId);
      const url = res?.download_url || res?.url || (typeof res === 'string' ? res : null);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Signed download URL received.');
      }
    } catch (err) {
      alert(`Download error: ${err.message}`);
    }
  };

  // Relevance format helper (handles 0-1 or 0-100)
  const formatRelevance = (score) => {
    if (score === undefined || score === null) return 'N/A';
    const num = Number(score);
    if (isNaN(num)) return score;
    const pct = num <= 1 ? Math.round(num * 100) : Math.round(num);
    return `${pct}% Match`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Medical Document Intelligence Search
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Execute natural language or keyword searches against extracted clinical text (GET /api/search)
        </p>
      </div>

      {/* Main Search Input */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          placeholder="Search symptoms, diagnoses, patient names, or lab reports..."
          autoFocus
        />

        {/* Query Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Suggested:</span>
          </span>
          {SUGGESTED_QUERIES.map((sq) => (
            <button
              key={sq}
              type="button"
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 hover:text-blue-700 text-slate-600 transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorMessage
          error={error}
          onRetry={() => handleSearch(query)}
          title="Search Service Error"
        />
      )}

      {/* Loading state */}
      {loading && <Loading message="Searching indexed medical reports and extracted records..." />}

      {/* Results Section */}
      {!loading && results !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Search Results ({results.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Query: "{query}"
            </span>
          </div>

          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((item, idx) => {
                const doc = item.document || item;
                const score = item.relevance_score ?? item.score;
                const pt = patientMap[doc.patient_id] || (item.patient ? item.patient : null);

                return (
                  <div
                    key={doc.id || idx}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                            {doc.file_name || 'Medical Record Document'}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono capitalize">
                            {doc.document_type?.replace(/_/g, ' ') || 'Report'}
                          </span>
                        </div>

                        {/* Patient and snippet */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span>
                              {pt ? `${pt.full_name} (${pt.patient_code || 'Patient'})` : doc.patient_id || 'Unknown Patient'}
                            </span>
                          </span>

                          {doc.created_at && (
                            <span>
                              • {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                          )}

                          {item.snippet && (
                            <p className="w-full text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                              "...{item.snippet}..."
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Score, Status & Actions */}
                    <div className="flex items-center gap-4 sm:shrink-0 justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {score !== undefined && (
                        <div className="text-right">
                          <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 block">
                            {formatRelevance(score)}
                          </span>
                          <span className="text-[10px] text-slate-400">Relevance</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            (doc.status || '').toUpperCase() === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {doc.status || 'PROCESSING'}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View extracted data"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(doc.id, doc.file_name)}
                          className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <SearchIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                No matching records found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                No document content matched the query "{query}". Try searching with alternate medical terminology or patient name.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial Empty State Guide */}
      {results === null && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Query Medical OCR & Extracted Diagnoses
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Enter clinical keywords, laboratory tests, patient IDs, or physician impressions to retrieve matching records from the backend search index.
          </p>
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
    </div>
  );
}

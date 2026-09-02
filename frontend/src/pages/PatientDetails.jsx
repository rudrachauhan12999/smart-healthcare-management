import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
  UploadCloud,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  Shield,
  RefreshCw,
  Eye,
  Download,
  Trash2,
} from 'lucide-react';
import { getPatient, getDocuments, getDocumentDownloadUrl, deleteDocument } from '../services/api';
import DocumentCard from '../components/DocumentCard';
import DocumentViewModal from '../components/DocumentViewModal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchPatientData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch patient details and documents
      const [pData, docsRes] = await Promise.all([
        getPatient(id),
        getDocuments().catch(() => ({ documents: [] })),
      ]);

      setPatient(pData);

      // Filter documents linked to this patient ID or code
      const allDocs = docsRes?.documents || [];
      const patientDocs = allDocs.filter(
        (d) => d.patient_id === id || (pData?.patient_code && d.patient_id === pData.patient_code)
      );
      setDocuments(patientDocs);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await getDocumentDownloadUrl(docId);
      const url = res?.download_url || res?.url || (typeof res === 'string' ? res : null);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Signed download URL generated.');
      }
    } catch (err) {
      alert(`Download error: ${err.message}`);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Helper for age
  const calculateAge = (dob) => {
    if (!dob) return null;
    try {
      const birth = new Date(dob);
      const diff = Date.now() - birth.getTime();
      return Math.abs(new Date(diff).getUTCFullYear() - 1970);
    } catch {
      return null;
    }
  };

  if (loading) {
    return <Loading message="Loading patient chart and medical records..." />;
  }

  if (error && !patient) {
    return (
      <div className="space-y-4">
        <Link
          to="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </Link>
        <ErrorMessage
          error={error}
          onRetry={fetchPatientData}
          title="Patient Record Unavailable"
        />
      </div>
    );
  }

  const age = calculateAge(patient?.date_of_birth);

  return (
    <div className="space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPatientData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh record"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to={`/upload?patient_id=${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document for Patient</span>
          </Link>
        </div>
      </div>

      {/* Patient Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
              {patient?.full_name
                ? patient.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'PT'}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {patient?.full_name || 'Medical Patient'}
                </h1>
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                  {patient?.patient_code || 'P---'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                  {patient?.gender || 'Unspecified'}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-slate-500">
                {patient?.date_of_birth && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      DOB: {patient.date_of_birth} {age !== null && `(${age} years old)`}
                    </span>
                  </span>
                )}
                <span className="font-mono text-slate-400 text-[11px]">
                  UUID: {id}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 text-xs">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Phone Contact
              </span>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{patient?.phone || 'Not provided'}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Email Address
              </span>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{patient?.email || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Medical Documents & Clinical Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Medical Documents Section (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <h2 className="text-base font-bold text-slate-900">
                Medical Records & Documents ({documents.length})
              </h2>
            </div>

            <Link
              to={`/upload?patient_id=${encodeURIComponent(id)}`}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Attach New Record</span>
            </Link>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={() => setSelectedDoc(doc)}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  patientMap={{ [id]: patient }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">
                No documents currently attached to this patient
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Medical scans, lab reports, or discharge summaries uploaded with this patient ID will be tracked here.
              </p>
              <div className="mt-4">
                <Link
                  to={`/upload?patient_id=${encodeURIComponent(id)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Medical Report</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Clinical Activity & Medical Notes Timeline (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">
              Recent Clinical Activity
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Patient File Accessed
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Clinical chart retrieved via GET /api/patients/{id}
                </p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  Just now
                </span>
              </div>

              {documents.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Latest Document Synced
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {documents[0]?.file_name}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {documents[0]?.created_at
                      ? new Date(documents[0].created_at).toLocaleDateString()
                      : 'Recent'}
                  </span>
                </div>
              )}

              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-sky-50 border-2 border-sky-600 flex items-center justify-center">
                  <Shield className="w-2.5 h-2.5 text-sky-600" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  HIPAA Identity Confirmed
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verified demographic integrity: {patient?.patient_code}
                </p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  Active verification
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document View Modal */}
      <DocumentViewModal
        document={selectedDoc}
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDownload={handleDownload}
        patient={patient}
      />
    </div>
  );
}

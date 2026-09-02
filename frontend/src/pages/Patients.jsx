import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowUpDown,
  RefreshCw,
  Eye,
  FileText,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { getPatients } from '../services/api';
import PatientCard from '../components/PatientCard';
import SearchBar from '../components/SearchBar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const fetchPatientsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPatients();
      setPatients(res?.patients || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsList();
  }, []);

  // Filter and search logic
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.full_name && p.full_name.toLowerCase().includes(q)) ||
        (p.patient_code && p.patient_code.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q));

      const matchesGender =
        genderFilter === 'ALL' ||
        (p.gender && p.gender.toUpperCase() === genderFilter);

      return matchesSearch && matchesGender;
    });
  }, [patients, searchQuery, genderFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Patient Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registered healthcare patients, demographics, and clinical records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPatientsList}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorMessage
          error={error}
          onRetry={fetchPatientsList}
          title="Patient Directory Service Notice"
        />
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, code (P001), email, or phone..."
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Gender:</span>
          </span>
          {['ALL', 'MALE', 'FEMALE'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenderFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                genderFilter === g
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g === 'ALL' ? 'All' : g.charAt(0) + g.slice(1).toLowerCase()}
            </button>
          ))}

          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center border-l border-slate-200 pl-3 ml-1 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                viewMode === 'cards'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Cards
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

      {/* Directory Content */}
      {loading ? (
        <Loading variant="skeleton" count={6} />
      ) : filteredPatients.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((p) => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Code</th>
                    <th className="px-5 py-3.5">Patient Name</th>
                    <th className="px-5 py-3.5">Gender</th>
                    <th className="px-5 py-3.5">DOB</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-blue-700">
                        {p.patient_code || 'P---'}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {p.full_name}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                          {p.gender || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {p.date_of_birth || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 font-mono">
                        {p.phone || '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {p.email || '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/patients/${p.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            {searchQuery || genderFilter !== 'ALL'
              ? 'No patients match your search criteria'
              : 'No patient records found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery || genderFilter !== 'ALL'
              ? 'Try clearing your search query or gender filter to view all patients.'
              : 'Patients returned by GET /api/patients will automatically appear in this directory.'}
          </p>
          {(searchQuery || genderFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setGenderFilter('ALL');
              }}
              className="mt-4 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

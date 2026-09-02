import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Calendar, ArrowRight, FileText } from 'lucide-react';

export default function PatientCard({ patient }) {
  if (!patient) return null;

  const {
    id,
    patient_code = 'P---',
    full_name = 'Unknown Patient',
    date_of_birth,
    gender = 'Not specified',
    phone,
    email,
    document_count,
  } = patient;

  // Calculate age if date_of_birth is provided
  const calculateAge = (dob) => {
    if (!dob) return null;
    try {
      const birthDate = new Date(dob);
      const diffMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(diffMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch {
      return null;
    }
  };

  const age = calculateAge(date_of_birth);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top bar: Code and Gender */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            {patient_code}
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              gender?.toLowerCase() === 'female'
                ? 'bg-purple-50 text-purple-700 border border-purple-100'
                : gender?.toLowerCase() === 'male'
                ? 'bg-sky-50 text-sky-700 border border-sky-100'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {gender}
          </span>
        </div>

        {/* Name and Avatar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
            {full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || <User className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
              {full_name}
            </h3>
            {date_of_birth && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{date_of_birth}</span>
                {age !== null && <span className="text-slate-400">({age} yrs)</span>}
              </p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
          {phone ? (
            <div className="flex items-center gap-2 truncate">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{phone}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 italic">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>No phone on file</span>
            </div>
          )}

          {email ? (
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 italic">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>No email on file</span>
            </div>
          )}

          {document_count !== undefined && (
            <div className="flex items-center gap-2 text-slate-600 pt-1">
              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-medium text-slate-700">
                {document_count} medical {document_count === 1 ? 'record' : 'records'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <Link
          to={`/patients/${id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-xl transition-colors"
        >
          <span>View Patient Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

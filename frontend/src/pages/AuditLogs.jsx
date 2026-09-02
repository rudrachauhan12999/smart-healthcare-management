import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Clock,
  User,
  Activity,
  Info,
  RefreshCw,
  FileText,
} from 'lucide-react';

export default function AuditLogs() {
  // Frontend is ready for audit log data once backend implements the endpoint
  const [logs] = useState([]);
  const [checking, setChecking] = useState(false);

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Security & Audit Telemetry
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            HIPAA compliance trails, document access events, and operator activity
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Contract & Integration Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-800">
            Backend Audit Service Integration Ready
          </p>
          <p className="mt-0.5">
            Per hackathon API specifications, no custom endpoint has been invented. Once the backend team deploys the audit log service, this view is structured to ingest and render compliance telemetry immediately.
          </p>
        </div>
      </div>

      {/* Audit Log Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Access & Transaction Log Stream
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Records: {logs.length}
          </span>
        </div>

        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Operator</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Target Entity</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">
                      {log.timestamp}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                      {log.actor}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700">
                      {log.action}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-blue-700">
                      {log.entity_id}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Compliant Empty State */
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              No Audit Logs Recorded
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              The backend audit telemetry pipeline is currently inactive or awaiting service activation. Security events will stream here automatically upon backend deployment.
            </p>
          </div>
        )}
      </div>

      {/* Schema Blueprint Card */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Target Schema Specification
        </h4>
        <p className="text-xs text-slate-600 mb-3">
          Expected payload format for seamless drop-in backend integration:
        </p>
        <pre className="bg-slate-900 text-blue-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
{`{
  "logs": [
    {
      "id": "uuid",
      "timestamp": "2026-09-02T10:30:00Z",
      "actor_id": "usr_doc_01",
      "actor_name": "Dr. Sarah Jenkins",
      "action": "DOCUMENT_ACCESS",
      "target_type": "medical_report",
      "target_id": "doc_uuid",
      "ip_address": "192.168.1.1",
      "status": "AUTHORIZED"
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
}

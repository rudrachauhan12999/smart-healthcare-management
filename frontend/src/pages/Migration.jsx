import React, { useState } from 'react';
import {
  Database,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Server,
  ShieldAlert,
  ArrowRight,
  HardDrive,
  FileCheck,
  FileX,
} from 'lucide-react';
import { startMigration } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

export default function Migration() {
  const [running, setRunning] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStartMigration = async () => {
    setShowConfirm(false);
    setRunning(true);
    setError(null);
    try {
      const response = await startMigration();
      setMigrationResult(response);
    } catch (err) {
      setError(err);
    } finally {
      setRunning(false);
    }
  };

  const successRate = migrationResult?.total_records
    ? Math.round(
        (migrationResult.successful_records / migrationResult.total_records) * 100
      )
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Legacy EHR Data Migration
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Migrate and index legacy patient archives into the Smart Healthcare Cloud Database
        </p>
      </div>

      {/* Migration Overview & Action Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Batch Record Synchronization Engine
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
                Executes POST /api/migration/start to ingest batch records, standardize patient identifiers, and queue extracted document metadata.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={running}
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 shrink-0"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Migrating Records...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Migration</span>
              </>
            )}
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <ErrorMessage
            error={error}
            onRetry={handleStartMigration}
            onDismiss={() => setError(null)}
            title="Migration Pipeline Error"
          />
        )}

        {/* Running Indicator */}
        {running && (
          <div className="p-6 bg-blue-50/60 border border-blue-200 rounded-2xl text-center space-y-3 animate-pulse">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900">
              Executing POST /api/migration/start
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Extracting legacy records, validating UUID keys, and synchronizing database records. Please do not navigate away...
            </p>
          </div>
        )}

        {/* Results Card */}
        {migrationResult && !running && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Migration Process Report
                </h3>
              </div>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                ID: {migrationResult.migration_id || 'uuid'}
              </span>
            </div>

            {/* Metric KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Status
                </span>
                <span className="text-sm font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block border border-blue-100">
                  {migrationResult.status || 'COMPLETED'}
                </span>
              </div>

              {/* Total Records */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Records
                </span>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {migrationResult.total_records ?? 0}
                </span>
              </div>

              {/* Successful Records */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 block mb-1 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Successful</span>
                </span>
                <span className="text-xl font-bold text-emerald-700 font-mono">
                  {migrationResult.successful_records ?? 0}
                </span>
              </div>

              {/* Failed Records */}
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 block mb-1 flex items-center gap-1">
                  <FileX className="w-3.5 h-3.5" />
                  <span>Failed</span>
                </span>
                <span className="text-xl font-bold text-rose-700 font-mono">
                  {migrationResult.failed_records ?? 0}
                </span>
              </div>
            </div>

            {/* Success rate progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Integrity Completion Rate</span>
                <span className="font-mono text-slate-600">{successRate}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty state before running */}
        {!migrationResult && !running && (
          <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            <HardDrive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">
              No active migration running
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click the "Start Migration" button above to initiate batch database migration from legacy hospital feeds.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Initiate EHR Data Migration?
                </h3>
                <p className="text-xs text-slate-500">
                  Endpoint: POST /api/migration/start
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              This will trigger the backend migration job to process legacy medical documents and synchronize records into the primary data store.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartMigration}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Confirm & Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

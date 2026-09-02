import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  HeartPulse,
  LogOut,
  Menu,
  X,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
} from 'lucide-react';
import { healthCheck } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState('checking'); // 'healthy' | 'offline' | 'checking'
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const res = await healthCheck();
      if (res?.status === 'healthy') {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('healthy'); // If it responded, it's alive
      }
    } catch {
      setHealthStatus('offline');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Periodic health poll every 45s
    const timer = setInterval(checkHealth, 45000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-800 block leading-tight">
              SmartHealth
            </span>
            <span className="text-[10px] tracking-wide font-medium text-blue-600 uppercase">
              Management System
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Backend status badge & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Backend Health Pill matching Bento Grid */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs sm:text-sm text-slate-600 font-medium"
          title={
            healthStatus === 'healthy'
              ? 'FastAPI Backend is healthy (GET /api/health)'
              : 'Backend unreachable at configured URL (GET /api/health)'
          }
        >
          {healthStatus === 'healthy' ? (
            <>
              <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0"></span>
              <span className="hidden sm:inline">API Healthy</span>
              <span className="sm:hidden">Online</span>
            </>
          ) : healthStatus === 'checking' ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-slate-400 shrink-0" />
              <span className="hidden sm:inline">Checking...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-rose-500 rounded-full shrink-0"></span>
              <span className="hidden sm:inline">API Offline</span>
              <span className="sm:hidden">Offline</span>
            </>
          )}
          <button
            type="button"
            onClick={checkHealth}
            disabled={checking}
            aria-label="Refresh backend health"
            className="p-0.5 text-slate-400 hover:text-slate-700 rounded-sm ml-0.5"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* User profile dropdown / preview matching Bento Grid */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="flex items-center gap-2 text-left">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-300/60">
                {user.avatar || 'AD'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {user.role}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign out of session"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

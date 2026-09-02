import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Files,
  UploadCloud,
  Search,
  Database,
  ShieldCheck,
  Activity,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/patients',
    label: 'Patients',
    icon: Users,
  },
  {
    to: '/documents',
    label: 'Documents',
    icon: Files,
  },
  {
    to: '/upload',
    label: 'Upload Document',
    icon: UploadCloud,
  },
  {
    to: '/search',
    label: 'Search Records',
    icon: Search,
  },
  {
    to: '/migration',
    label: 'Data Migration',
    icon: Database,
  },
  {
    to: '/audit-logs',
    label: 'Audit Logs',
    icon: ShieldCheck,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header for Mobile / Desktop */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 tracking-tight text-lg block leading-tight">
              SmartHealth
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Clinical Portal
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-blue-700' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Bento System API Box */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                System API
              </span>
            </div>
            <p
              className="text-[10px] text-slate-400 font-mono overflow-hidden truncate"
              title={apiBaseUrl}
            >
              {apiBaseUrl}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

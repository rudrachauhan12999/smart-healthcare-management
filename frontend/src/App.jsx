import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Documents from './pages/Documents';
import UploadDocument from './pages/UploadDocument';
import Search from './pages/Search';
import Migration from './pages/Migration';
import AuditLogs from './pages/AuditLogs';

/**
 * Main Layout wrapper with responsive Sidebar and Navbar
 */
function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 transition-all duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          <Route
            path="/patients"
            element={
              <MainLayout>
                <Patients />
              </MainLayout>
            }
          />

          <Route
            path="/patients/:id"
            element={
              <MainLayout>
                <PatientDetails />
              </MainLayout>
            }
          />

          <Route
            path="/documents"
            element={
              <MainLayout>
                <Documents />
              </MainLayout>
            }
          />

          <Route
            path="/upload"
            element={
              <MainLayout>
                <UploadDocument />
              </MainLayout>
            }
          />

          <Route
            path="/search"
            element={
              <MainLayout>
                <Search />
              </MainLayout>
            }
          />

          <Route
            path="/migration"
            element={
              <MainLayout>
                <Migration />
              </MainLayout>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <MainLayout>
                <AuditLogs />
              </MainLayout>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

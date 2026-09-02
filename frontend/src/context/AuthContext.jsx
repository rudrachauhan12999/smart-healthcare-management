import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Modular Authentication Context
 * Designed for seamless swap with Supabase Auth or OAuth provider.
 */
const AuthContext = createContext(null);

const DEMO_USERS = [
  {
    id: 'usr_doc_01',
    email: 'sarah.jenkins@hospital.org',
    full_name: 'Dr. Sarah Jenkins, MD',
    role: 'Chief Medical Officer',
    department: 'Internal Medicine',
    avatar: 'SJ',
  },
  {
    id: 'usr_rec_02',
    email: 'records.admin@hospital.org',
    full_name: 'Marcus Vance',
    role: 'Health Records Administrator',
    department: 'Health Informatics',
    avatar: 'MV',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shms_auth_user');
      return saved ? JSON.parse(saved) : DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('shms_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('shms_auth_user');
    }
  }, [user]);

  /**
   * Demo Sign In
   * Replace this implementation with Supabase Auth:
   * const { data, error } = await supabase.auth.signInWithPassword({ email, password });
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulate network authentication handshake
      await new Promise((resolve) => setTimeout(resolve, 400));
      const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
        id: `usr_${Date.now()}`,
        email: email || 'physician@hospital.org',
        full_name: email ? email.split('@')[0].replace('.', ' ') : 'Clinical Staff',
        role: 'Attending Physician',
        department: 'General Care',
        avatar: 'CS',
      };
      setUser(matched);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Demo Sign Out
   * Replace with: await supabase.auth.signOut();
   */
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        demoUsers: DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

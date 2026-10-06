import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemo: (role: Role) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isEngineer: boolean;
  isViewer: boolean;
  canInspect: boolean;
  canManage: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initUser() {
      try {
        const storedToken = localStorage.getItem('geoinfra_token');
        if (storedToken) {
          const profile = await api.getCurrentUser();
          setUser(profile);
        } else {
          // Default to field engineer demo on initial landing for seamless discovery
          await loginAsDemo('ENGINEER');
        }
      } catch (err) {
        console.warn('Session expired or offline, falling back to default Inspector role');
        setUser({
          id: 'usr-eng',
          email: 'inspector@geoinfra.io',
          name: 'Marcus Vance',
          role: 'ENGINEER',
          organization: 'GeoInfra Field Operations',
          department: 'Structural Inspection Division',
        });
        localStorage.setItem('geoinfra_token', 'token-usr-eng');
      } finally {
        setLoading(false);
      }
    }
    initUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('geoinfra_token', res.token);
    setUser(res.user);
  };

  const loginAsDemo = async (role: Role) => {
    let email = 'inspector@geoinfra.io';
    let pass = 'inspector123';

    if (role === 'ADMIN') {
      email = 'admin@geoinfra.io';
      pass = 'admin123';
    } else if (role === 'VIEWER') {
      email = 'viewer@geoinfra.io';
      pass = 'viewer123';
    }

    try {
      const res = await api.login(email, pass);
      localStorage.setItem('geoinfra_token', res.token);
      setUser(res.user);
    } catch {
      // In-memory fallback
      const mockUsers: Record<Role, User> = {
        ADMIN: {
          id: 'usr-admin',
          email: 'admin@geoinfra.io',
          name: 'Dr. Sarah Lin, PE',
          role: 'ADMIN',
          organization: 'Department of Transportation',
          department: 'Infrastructure Asset Management',
        },
        ENGINEER: {
          id: 'usr-eng',
          email: 'inspector@geoinfra.io',
          name: 'Marcus Vance',
          role: 'ENGINEER',
          organization: 'GeoInfra Field Operations',
          department: 'Structural Inspection Division',
        },
        VIEWER: {
          id: 'usr-viewer',
          email: 'viewer@geoinfra.io',
          name: 'Elena Rostova',
          role: 'VIEWER',
          organization: 'Municipal Oversight Committee',
          department: 'Public Works Audit',
        },
      };
      setUser(mockUsers[role]);
      localStorage.setItem('geoinfra_token', `token-${mockUsers[role].id}`);
    }
  };

  const logout = () => {
    localStorage.removeItem('geoinfra_token');
    loginAsDemo('VIEWER');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isEngineer = user?.role === 'ENGINEER';
  const isViewer = user?.role === 'VIEWER';
  const canInspect = isAdmin || isEngineer;
  const canManage = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginAsDemo,
        logout,
        isAdmin,
        isEngineer,
        isViewer,
        canInspect,
        canManage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

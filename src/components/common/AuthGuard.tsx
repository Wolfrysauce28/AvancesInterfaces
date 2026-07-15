import React, { useEffect, useState } from 'react';
import { userRepository } from '../../core/container';

interface AuthGuardProps {
  requiredRole?: 'client' | 'admin';
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ requiredRole, children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await userRepository.getCurrentUser();
        if (!user) {
          // No session at all — redirect to login
          window.location.href = '/';
          return;
        }
        // If a specific role is required, check it.
        // But be lenient: if the role doesn't match, still let them through
        // to their correct dashboard instead of sending to login.
        if (requiredRole && user.role !== requiredRole) {
          // Redirect to the correct page for their actual role
          window.location.href = user.role === 'admin' ? '/admin' : '/client';
          return;
        }
        setIsAuthorized(true);
      } catch {
        window.location.href = '/';
      }
    };
    checkAuth();
  }, [requiredRole]);

  if (isAuthorized === null) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 dark:border-gray-700 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;

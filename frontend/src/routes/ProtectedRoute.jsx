import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth/AuthService';
import { AuthProvider } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
 const [authStatus, setAuthStatus] = useState(null);
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const result = await isAuthenticated();
        if (isMounted) setAuthStatus(result);
      } catch (error) {
        console.error("Error checking authentication status in PrivateRoute:", error);
        if (isMounted) setAuthStatus(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  if (authStatus === null) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5em' }}>Verificando sesión...</div>;
  }

  if (!authStatus) {
    return <Navigate to="/" replace />;
  }

  return <AuthProvider>{children}</AuthProvider>;
};

export default ProtectedRoute;

import { useAuth } from '@/context/AuthContext';
import React from 'react';
import { Navigate } from 'react-router';

interface PublicRouteProps {
    children: React.ReactNode;
}

const AuthRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-foreground">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        // Redirect based on role
        if (user?.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AuthRoute;

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Guards a subtree of routes. Usage:
 *   <Route element={<RoleProtectedRoute allowedRoles={['student']} />}>
 *     <Route path="/student/*" element={...} />
 *   </Route>
 * Waits for the initial silent-refresh (bootstrapSession) to settle before
 * redirecting, so a page refresh doesn't briefly bounce a logged-in user to /login.
 */
export default function RoleProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-parchment">
        <div className="animate-pulse text-navy-400 font-body text-sm">Loading your session…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

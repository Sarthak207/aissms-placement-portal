import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { loginUser, logoutUser } from '../features/auth/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, status, error, initialized } = useSelector((state) => state.auth);

  const login = useCallback((credentials) => dispatch(loginUser(credentials)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

  return {
    user,
    role: user?.role,
    isAuthenticated: !!user,
    initialized,
    status,
    error,
    login,
    logout,
  };
}

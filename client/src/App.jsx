import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { bootstrapSession } from './features/auth/authSlice';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // On first load, attempt a silent refresh so a returning user (valid refresh cookie)
    // doesn't have to log in again.
    dispatch(bootstrapSession());
  }, [dispatch]);

  return <AppRoutes />;
}

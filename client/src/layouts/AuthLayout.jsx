import { Link, Outlet } from 'react-router-dom';
import Logo from '../components/Logo';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="mb-3">
            <Logo size={56} />
          </Link>
          <Link to="/" className="font-display text-2xl font-semibold text-parchment">
            AISSMS <span className="text-seal">Placement</span>
          </Link>
          <p className="text-navy-100 text-sm mt-1">Placement Management Portal</p>
        </div>
        <div className="bg-parchment-100 rounded-card shadow-card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

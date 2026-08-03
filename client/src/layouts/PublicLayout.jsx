import { Link, Outlet } from 'react-router-dom';
import Logo from '../components/Logo';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <header className="border-b border-navy-100 bg-parchment-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo size={36} showWordmark wordmarkClassName="text-lg text-navy" />
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-navy hover:text-seal-dark px-3 py-2">
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-navy text-parchment px-4 py-2 rounded-card hover:bg-navy-600"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-navy-100 py-6 text-center text-xs text-slate-light">
        © {new Date().getFullYear()} AISSMS College, Pune — Placement Cell
      </footer>
    </div>
  );
}

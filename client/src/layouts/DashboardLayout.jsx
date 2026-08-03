import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Building2,
  Briefcase,
  FileText,
  Bell,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import clsx from '../utils/clsx';
import Logo from '../components/Logo';

const NAV_BY_ROLE = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'Profile', icon: User },
    { to: '/student/companies', label: 'Companies', icon: Building2 },
    { to: '/student/applications', label: 'Applications', icon: FileText },
  ],
  company_hr: [
    { to: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/company/drives', label: 'Drives', icon: Briefcase },
  ],
  tpo: [
    { to: '/tpo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tpo/companies', label: 'Companies', icon: Building2 },
    { to: '/tpo/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/tpo/reports', label: 'Reports', icon: FileText },
  ],
  coordinator: [
    { to: '/coordinator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/coordinator/verify-students', label: 'Verify Students', icon: Users },
    { to: '/coordinator/announcements', label: 'Announcements', icon: Megaphone },
  ],
  admin: [
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
};

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  useSocket(!!user);
  const navItems = NAV_BY_ROLE[role] || [];

  return (
    <div className="min-h-screen bg-parchment flex">
      <aside className="w-64 bg-navy text-parchment flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <Logo size={32} showWordmark wordmarkClassName="text-parchment text-base" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-colors',
                  isActive ? 'bg-seal text-navy' : 'text-navy-100 hover:bg-white/10'
                )
              }
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-navy-100 capitalize">{role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-card text-sm font-medium text-navy-100 hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-navy-100 bg-parchment-100 flex items-center justify-end px-6 gap-4 shrink-0">
          <NavLink to="/notifications" className="relative p-2 rounded-full hover:bg-navy-50">
            <Bell className="w-5 h-5 text-navy" />
          </NavLink>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

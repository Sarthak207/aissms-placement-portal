import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import RoleProtectedRoute from './RoleProtectedRoute';

// Public/auth pages load eagerly — they're the entry point, no benefit to splitting them.
import LandingPage from '../pages/landing/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import NotFound from '../pages/errors/NotFound';
import Forbidden from '../pages/errors/Forbidden';
import ServerError from '../pages/errors/ServerError';

// Role dashboards are lazy-loaded: a student never downloads the TPO/Admin/Company
// bundles (which pull in Recharts) and vice versa — this is what keeps the initial
// bundle small despite five full role-specific page sets.
const StudentDashboard = lazy(() => import('../pages/student/Dashboard'));
const StudentProfile = lazy(() => import('../pages/student/Profile'));
const StudentCompanies = lazy(() => import('../pages/student/Companies'));
const StudentCompanyDetails = lazy(() => import('../pages/student/CompanyDetails'));
const StudentApplications = lazy(() => import('../pages/student/Applications'));

const CompanyDashboard = lazy(() => import('../pages/company/Dashboard'));
const CompanyDrives = lazy(() => import('../pages/company/Drives'));
const CompanyDriveApplicants = lazy(() => import('../pages/company/DriveApplicants'));

const TPODashboard = lazy(() => import('../pages/tpo/Dashboard'));
const TPOManageCompanies = lazy(() => import('../pages/tpo/ManageCompanies'));
const TPOAnalytics = lazy(() => import('../pages/tpo/Analytics'));
const TPOReports = lazy(() => import('../pages/tpo/Reports'));

const CoordinatorDashboard = lazy(() => import('../pages/coordinator/Dashboard'));
const VerifyStudents = lazy(() => import('../pages/coordinator/VerifyStudents'));
const CoordinatorAnnouncements = lazy(() => import('../pages/coordinator/Announcements'));

const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminDepartments = lazy(() => import('../pages/admin/Departments'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-seal border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Student */}
        <Route element={<RoleProtectedRoute allowedRoles={['student']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/companies" element={<StudentCompanies />} />
            <Route path="/student/companies/:id" element={<StudentCompanyDetails />} />
            <Route path="/student/applications" element={<StudentApplications />} />
          </Route>
        </Route>

        {/* Company HR */}
        <Route element={<RoleProtectedRoute allowedRoles={['company_hr']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/drives" element={<CompanyDrives />} />
            <Route path="/company/drives/:id/applicants" element={<CompanyDriveApplicants />} />
          </Route>
        </Route>

        {/* TPO */}
        <Route element={<RoleProtectedRoute allowedRoles={['tpo']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/tpo/dashboard" element={<TPODashboard />} />
            <Route path="/tpo/companies" element={<TPOManageCompanies />} />
            <Route path="/tpo/analytics" element={<TPOAnalytics />} />
            <Route path="/tpo/reports" element={<TPOReports />} />
          </Route>
        </Route>

        {/* Coordinator */}
        <Route element={<RoleProtectedRoute allowedRoles={['coordinator']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />
            <Route path="/coordinator/verify-students" element={<VerifyStudents />} />
            <Route path="/coordinator/announcements" element={<CoordinatorAnnouncements />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Errors */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/server-error" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

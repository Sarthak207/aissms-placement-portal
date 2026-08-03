# Software Requirements Specification (SRS)
## AISSMS Placement Portal — MERN Stack

Version 1.0

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for the **AISSMS Placement Portal**, a web application that digitizes and manages the campus placement process for AISSMS College, Pune — covering student profiles, company drives, applications, interviews, offers, and placement analytics.

### 1.2 Scope
The system supports five roles (Student, Placement Coordinator, Placement Officer/TPO, Company HR, Admin) with role-based access control. It automates the placement lifecycle: student registration → profile building → drive publishing → eligibility filtering → application → shortlisting → interview scheduling → offer → analytics/reporting.

### 1.3 Intended Audience
Development team, college placement cell, students, recruiting companies, and system administrators.

### 1.4 Definitions
- **TPO** – Training & Placement Officer
- **Drive** – A recruitment process opened by a company for a specific role
- **CTC** – Cost to Company
- **RBAC** – Role-Based Access Control

---

## 2. Overall Description

### 2.1 Product Perspective
A standalone, cloud-deployed web application (React SPA frontend, Node/Express REST API backend, MongoDB Atlas database), replacing manual/Excel-based placement tracking.

### 2.2 User Classes and Characteristics

| Role | Description | Key Needs |
|---|---|---|
| Student | Applies to drives, manages profile/resume | Simplicity, transparency, notifications |
| Placement Coordinator | Department-level liaison | Approve profiles, verify documents |
| Placement Officer (TPO) | College-wide placement admin | Analytics, drive management, reporting |
| Company HR | External recruiter | Post drives, review/shortlist applicants |
| Admin | System owner | User/role/system management, backups |

### 2.3 Operating Environment
- Frontend: Vercel (React/Vite SPA)
- Backend: Render (Node.js/Express, containerized)
- Database: MongoDB Atlas (cloud cluster)
- File storage: Cloudinary (resumes, photos, logos, offer letters)
- Email: Nodemailer via SMTP provider (e.g. SendGrid/Gmail SMTP)

### 2.4 Design & Implementation Constraints
- Must use JWT + refresh token rotation (no server-side session storage except a `Sessions` collection for refresh-token/device tracking).
- Must enforce RBAC at both route (middleware) and UI (route guard) levels.
- Must be responsive (mobile-first) and support dark/light themes.
- Must be horizontally scalable (stateless API instances).

### 2.5 Assumptions & Dependencies
- Companies are onboarded/verified by TPO before posting drives (prevents spam/fraud drives).
- CGPA/backlog data entered by students is self-reported at first, with coordinator verification against uploaded transcripts.

---

## 3. Functional Requirements (by module)

### FR-1 Authentication & Authorization
- FR-1.1 Register (Student self-signup with college email domain validation; HR signup with company verification; Coordinator/TPO/Admin created by Admin)
- FR-1.2 Login with JWT access token (15 min) + refresh token (7 days, httpOnly secure cookie, rotated on use)
- FR-1.3 Email verification via OTP/token link before first login
- FR-1.4 Forgot/Reset password via time-limited signed token emailed to user
- FR-1.5 "Remember me" extends refresh token lifetime
- FR-1.6 Rate limiting on `/auth/*` routes; account lock after 5 failed attempts (15 min cooldown); CAPTCHA required after 3 failed attempts
- FR-1.7 RBAC middleware restricting every route by role and, where applicable, ownership (e.g., a student can only edit their own profile)

### FR-2 Student Module
- Profile CRUD (personal, academic, skills, projects, certifications, coding profiles)
- Resume/photo/document upload (Cloudinary, virus/type/size validated)
- Browse/search/filter/bookmark companies & drives
- Apply / withdraw application (respecting eligibility & deadline rules)
- Track application status (Applied → Shortlisted → Interview → Selected/Rejected)
- View & download offer letters (PDF)
- Dashboard: profile completion %, eligible/applied/selected drives, CGPA, notifications

### FR-3 Company/HR Module
- HR registration + email verification, subject to TPO approval before activation
- Create/edit/delete/close placement drives with full eligibility criteria
- View & filter applicants against drive criteria
- Shortlist / reject candidates, schedule interviews, issue offer letters (auto-generated PDF)
- Export applicant list (Excel)

### FR-4 Placement Officer (TPO) Module
- Dashboard with aggregate KPIs (placed %, avg/highest package, branch-wise stats)
- Approve/reject company registrations and drives
- Manage coordinators, students, companies, drives
- Generate & export PDF/Excel reports
- Broadcast notifications/announcements

### FR-5 Placement Coordinator Module
- Approve/verify student profiles & documents (department-scoped)
- Post department announcements
- Track student application progress

### FR-6 Admin Module
- Manage all users, roles, permissions, departments, branches
- View audit logs, system settings
- Database backup/restore trigger
- Global analytics

### FR-7 Notifications
- In-app real-time (Socket.io or polling) + email (Nodemailer) for: application status change, new eligible drive, interview scheduled, offer issued, announcements

### FR-8 Search & Analytics & Reports
- Multi-field filterable/paginated/sortable search across companies/drives/students
- Recharts dashboards: placement %, branch-wise placements, package distribution, monthly trend, top recruiters
- PDF (pdf-lib) and Excel (SheetJS) report generation

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | Helmet, CORS allowlist, express-rate-limit, mongo-sanitize, XSS-clean, bcrypt (cost 12), JWT short expiry + rotation, CSRF token for cookie-based mutations |
| Performance | API p95 < 300ms for list endpoints with proper indexing & pagination |
| Scalability | Stateless API (horizontally scalable), MongoDB indexes on frequently queried fields |
| Availability | 99.5% target; graceful error handling; health-check endpoint |
| Usability | WCAG-AA color contrast, responsive down to 360px width |
| Maintainability | MVC layering, ESLint/Prettier, modular services, environment-based config |
| Auditability | AuditLogs collection recording all state-changing admin/HR actions |

---

## 5. Acceptance Criteria (sample)
- A student cannot apply to a drive if CGPA/branch/backlog/passing-year criteria are not met (enforced server-side, not just UI-hidden).
- A JWT access token cannot be used after expiry even if the refresh token is valid; refresh endpoint issues a new pair and invalidates the old refresh token (rotation).
- HR cannot view another company's applicant data (row-level authorization).
- All file uploads are restricted by MIME type and size (resume: PDF ≤ 5MB; photo: JPG/PNG ≤ 2MB).

---
*Next: See `02-ARCHITECTURE.md`, `03-ER-DIAGRAM.md`, `04-DATABASE-SCHEMA.md`, `05-API-DOCUMENTATION.md`, `06-FOLDER-STRUCTURE.md`.*

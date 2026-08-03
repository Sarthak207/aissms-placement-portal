# Complete Folder Structure — AISSMS Placement Portal

```
aissms-placement-portal/
│
├── server/                              # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                    # Mongoose connection
│   │   │   ├── cloudinary.js
│   │   │   ├── env.js                   # validated env vars (Zod)
│   │   │   └── logger.js                # Winston logger
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Student.js
│   │   │   ├── Company.js
│   │   │   ├── CompanyHR.js
│   │   │   ├── PlacementDrive.js
│   │   │   ├── Application.js
│   │   │   ├── Interview.js
│   │   │   ├── OfferLetter.js
│   │   │   ├── Notification.js
│   │   │   ├── Announcement.js
│   │   │   ├── Department.js
│   │   │   ├── Branch.js
│   │   │   ├── Coordinator.js
│   │   │   ├── AuditLog.js
│   │   │   └── Session.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── student.controller.js
│   │   │   ├── company.controller.js
│   │   │   ├── drive.controller.js
│   │   │   ├── application.controller.js
│   │   │   ├── interview.controller.js
│   │   │   ├── offer.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── announcement.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   ├── report.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── student.routes.js
│   │   │   ├── company.routes.js
│   │   │   ├── drive.routes.js
│   │   │   ├── application.routes.js
│   │   │   ├── interview.routes.js
│   │   │   ├── offer.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── announcement.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   ├── report.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── index.js                 # mounts all routers under /api/v1
│   │   │
│   │   ├── middleware/
│   │   │   ├── authenticate.js
│   │   │   ├── authorize.js              # RBAC
│   │   │   ├── validate.js               # Zod schema validation
│   │   │   ├── rateLimiter.js
│   │   │   ├── upload.js                 # Multer config
│   │   │   ├── errorHandler.js
│   │   │   └── notFound.js
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── student.service.js
│   │   │   ├── drive.service.js
│   │   │   ├── application.service.js    # eligibility engine, state machine
│   │   │   ├── notification.service.js
│   │   │   ├── email.service.js          # Nodemailer templates
│   │   │   ├── pdf.service.js            # pdf-lib offer letters/reports
│   │   │   ├── excel.service.js          # SheetJS exports
│   │   │   └── analytics.service.js
│   │   │
│   │   ├── validations/                  # Zod schemas
│   │   │   ├── auth.validation.js
│   │   │   ├── student.validation.js
│   │   │   ├── drive.validation.js
│   │   │   └── application.validation.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── apiResponse.js
│   │   │   ├── apiError.js
│   │   │   ├── asyncHandler.js
│   │   │   └── pagination.js
│   │   │
│   │   ├── sockets/
│   │   │   └── notification.socket.js
│   │   │
│   │   ├── app.js                        # Express app (middleware wiring)
│   │   └── server.js                     # HTTP server bootstrap
│   │
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── client/                              # React (Vite) frontend
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js                 # Redux Toolkit store
│   │   │
│   │   ├── features/
│   │   │   ├── auth/authSlice.js
│   │   │   ├── students/studentsSlice.js
│   │   │   ├── companies/companiesSlice.js
│   │   │   ├── drives/drivesSlice.js
│   │   │   ├── applications/applicationsSlice.js
│   │   │   └── notifications/notificationsSlice.js
│   │   │
│   │   ├── services/
│   │   │   ├── axiosInstance.js         # interceptors: auth header, refresh
│   │   │   ├── authApi.js
│   │   │   ├── studentApi.js
│   │   │   ├── companyApi.js
│   │   │   ├── driveApi.js
│   │   │   ├── applicationApi.js
│   │   │   └── analyticsApi.js
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                      # Button, Input, Modal, Card, Badge...
│   │   │   ├── table/DataTable.jsx      # TanStack Table wrapper
│   │   │   ├── charts/                  # Recharts wrappers
│   │   │   ├── skeletons/
│   │   │   ├── EmptyState.jsx
│   │   │   └── Toaster.jsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── PublicLayout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── landing/LandingPage.jsx
│   │   │   ├── auth/Login.jsx, Register.jsx, ForgotPassword.jsx, ResetPassword.jsx
│   │   │   ├── student/Dashboard.jsx, Profile.jsx, Companies.jsx, CompanyDetails.jsx, Applications.jsx
│   │   │   ├── company/Dashboard.jsx, Drives.jsx, DriveApplicants.jsx
│   │   │   ├── tpo/Dashboard.jsx, ManageCompanies.jsx, Analytics.jsx, Reports.jsx
│   │   │   ├── coordinator/Dashboard.jsx, VerifyStudents.jsx
│   │   │   ├── admin/Users.jsx, Departments.jsx, AuditLogs.jsx, Settings.jsx
│   │   │   └── errors/NotFound.jsx, Forbidden.jsx, ServerError.jsx
│   │   │
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   └── RoleProtectedRoute.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── usePagination.js
│   │   │   ├── useDebounce.js
│   │   │   └── useSocket.js
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── constants.js
│   │   │
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── docs/                                # This documentation set
├── .gitignore
└── README.md
```

## Environment Variables

**server/.env.example**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CLIENT_URL=http://localhost:5173
```

**client/.env.example**
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

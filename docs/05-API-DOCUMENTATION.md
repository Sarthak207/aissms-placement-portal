# API Documentation — AISSMS Placement Portal

Base URL: `/api/v1`
Auth: `Authorization: Bearer <accessToken>` header (except public/auth routes). Refresh token sent via httpOnly cookie.

Response envelope:
```json
{ "success": true, "data": {}, "message": "", "meta": { "page": 1, "limit": 20, "total": 0 } }
```
Error envelope:
```json
{ "success": false, "message": "Human readable error", "errors": [ { "field": "email", "message": "Invalid email" } ] }
```

---

## Auth — `/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register student or company_hr |
| POST | `/auth/verify-email` | Public | Verify via emailed token/OTP |
| POST | `/auth/login` | Public | Returns access token + sets refresh cookie |
| POST | `/auth/refresh` | Public (cookie) | Rotates refresh token, returns new access token |
| POST | `/auth/logout` | Authenticated | Invalidates session |
| POST | `/auth/forgot-password` | Public | Sends reset link |
| POST | `/auth/reset-password` | Public | Resets password with token |
| GET | `/auth/me` | Authenticated | Current user profile |

## Students — `/students`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/students/me` | Student | Get own profile |
| PUT | `/students/me` | Student | Update own profile |
| POST | `/students/me/resume` | Student | Upload resume (Cloudinary) |
| POST | `/students/me/photo` | Student | Upload photo |
| GET | `/students` | Coordinator/TPO/Admin | List/search/filter students (paginated) |
| GET | `/students/:id` | Coordinator/TPO/Admin/Self | Get student by id |
| PATCH | `/students/:id/verify` | Coordinator/TPO | Approve/reject profile |
| POST | `/students/bulk-import` | TPO/Admin | CSV/Excel bulk import |

## Companies — `/companies`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/companies` | Company HR | Create company profile (pending approval) |
| GET | `/companies` | All authenticated | List/search/filter companies |
| GET | `/companies/:id` | All authenticated | Company details |
| PUT | `/companies/:id` | Company HR (own)/Admin | Update |
| PATCH | `/companies/:id/approve` | TPO/Admin | Approve/reject company |
| POST | `/companies/:id/bookmark` | Student | Bookmark/unbookmark |

## Drives — `/drives`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/drives` | Company HR/TPO | Create drive |
| GET | `/drives` | All authenticated | List with filters (package, role, branch, skills, location, status) |
| GET | `/drives/:id` | All authenticated | Drive details |
| PUT | `/drives/:id` | Owning HR/TPO | Edit |
| DELETE | `/drives/:id` | Owning HR/TPO/Admin | Delete |
| PATCH | `/drives/:id/close` | Owning HR/TPO | Close drive |
| GET | `/drives/:id/eligible-students` | Owning HR/TPO | List eligible students |
| GET | `/drives/:id/applicants` | Owning HR/TPO | List/filter applicants; export Excel via `?export=excel` |

## Applications — `/applications`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/applications` | Student | Apply to a drive (`driveId`) — server re-validates eligibility |
| DELETE | `/applications/:id` | Student (own) | Withdraw |
| GET | `/applications/me` | Student | My applications |
| GET | `/applications/:id` | Student(own)/HR(own drive)/TPO | Details |
| PATCH | `/applications/:id/status` | Company HR/TPO | Shortlist/reject/select |

## Interviews — `/interviews`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/interviews` | Company HR/TPO | Schedule interview for an application |
| PUT | `/interviews/:id` | Company HR/TPO | Reschedule/update feedback/result |
| GET | `/interviews/me` | Student | My scheduled interviews |

## Offer Letters — `/offers`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/offers` | Company HR/TPO | Issue offer (generates PDF via pdf-lib, stores in Cloudinary) |
| GET | `/offers/me` | Student | My offer letters |
| GET | `/offers/:id/download` | Student(own)/TPO | Download PDF |

## Notifications — `/notifications`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | Authenticated | List (paginated), unread count |
| PATCH | `/notifications/:id/read` | Authenticated | Mark read |
| PATCH | `/notifications/read-all` | Authenticated | Mark all read |

## Announcements — `/announcements`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/announcements` | Coordinator/TPO/Admin | Create |
| GET | `/announcements` | Authenticated | List (scoped by department/college-wide) |

## Analytics & Reports — `/analytics`, `/reports`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/analytics/overview` | TPO/Admin | Placed/unplaced, avg/highest package, branch-wise |
| GET | `/analytics/trends` | TPO/Admin | Monthly placement trend |
| GET | `/analytics/top-recruiters` | TPO/Admin | Top companies by hires |
| GET | `/reports/placement?format=pdf|excel` | TPO/Admin | Full placement report |
| GET | `/reports/branch/:branchId?format=pdf|excel` | TPO/Admin/Coordinator | Branch report |

## Admin — `/admin`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET/POST/PUT/DELETE | `/admin/users` | Admin | Manage users & roles |
| GET/POST/PUT/DELETE | `/admin/departments`, `/admin/branches` | Admin | Manage taxonomy |
| GET | `/admin/audit-logs` | Admin | Paginated audit trail |
| POST | `/admin/backup` | Admin | Trigger DB backup job |

---

## Common Query Params (list endpoints)
`?page=1&limit=20&sort=-createdAt&search=keyword&branch=CSE&minCgpa=7&status=open`

## Standard HTTP Status Codes Used
`200 OK · 201 Created · 204 No Content · 400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 409 Conflict (duplicate application) · 422 Validation Error · 429 Too Many Requests · 500 Internal Server Error`

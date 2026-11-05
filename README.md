# TOVU — Hair & Beauty Marketplace

**Your hair. Your style. Your moment.**

TOVU is a Kenya-first hair and beauty discovery and appointment marketplace for customers, independent stylists, and salons. The React 19 / TypeScript frontend is a working local preview; the Laravel API is being built as a separate backend service.

> **Current status:** Frontend preview plus an incremental Laravel backend foundation. The directory starts empty until real professionals register. This is not yet a production multi-user booking service.

## Frontend preview

- Discover and filter real provider profiles after registration.
- Explore editorial style inspiration references.
- Local-only profile, service, and booking interactions for interface preview.
- Browser-local JSON import/export for preview data only.

Browser storage does not synchronize users or bookings between devices. The local email lookup is not authentication. Do not use the preview data store for real customer records or live appointments.

## Backend API

The Laravel 12 API lives in the [backend directory](backend/README.md). It introduces MySQL-first persistence, Sanctum bearer-token authentication, customer/stylist/salon account roles, pending professional profiles, rate-limited authentication, request IDs, audit records, and a privacy-minimizing identity-verification gateway boundary.

Run backend setup and review the current API contract in [backend/README.md](backend/README.md). The React frontend is not yet wired to the API; do not enable live bookings until the API adapter and transactional booking workflow are complete.

## Technology

- Frontend: React 19, TypeScript, Vite, React Router, Zustand, Framer Motion, Lucide React.
- Backend: PHP 8.2+, Laravel 12, Laravel Sanctum, MySQL 8+.
- Automated backend checks: PHPUnit feature tests and GitHub Actions CI.

## Production roadmap

- [x] Laravel project foundation and environment configuration.
- [x] Customer, stylist, and salon account registration with role assignment.
- [x] Sanctum bearer-token login, logout, and current-account endpoints.
- [x] Professional profiles default to pending verification.
- [x] Identity-verification interface with no raw National ID retention in application tables.
- [ ] Approved identity-verification provider, legal review, and data-processing agreement.
- [ ] Salon ownership, teams, staff roles, and service management.
- [ ] Staff availability, business hours, and time-off management.
- [ ] Transactional booking conflict prevention and cancellation workflow.
- [ ] Customer booking history and provider booking management.
- [ ] Notifications and payment-provider adapters/reconciliation.
- [ ] Frontend API adapter and migration away from browser-local account/booking state.
- [ ] Full authorization, security review, operational monitoring, backups, and load testing for 100,000+ accounts.

## Security

Never commit secrets, API keys, passwords, National ID numbers, real customer data, or production exports. Use environment variables and managed secrets. Require HTTPS in deployed environments. Professional accounts remain unverified until a lawful verification process returns a trusted result. Do not treat any local preview record as a real business or booking.

## Development commands

Frontend: run npm install and npm run dev from the repository root. Run npm run typecheck and npm run build before frontend releases.

Backend: follow the installation, migration, and test steps in [backend/README.md](backend/README.md).

---

**TOVU — Your hair. Your style. Your moment.**
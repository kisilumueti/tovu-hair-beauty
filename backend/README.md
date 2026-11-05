# TOVU Laravel API

This directory contains the first Laravel 12 backend foundation for the existing React 19 / TypeScript application. The frontend remains a Vite application at the repository root; the API is a separate deployable service.

## Status

Implemented in this milestone:
- Laravel 12 application bootstrap and environment-based configuration.
- MySQL-first persistence configuration, with SQLite available for automated tests.
- Sanctum bearer-token authentication for customer, independent stylist, and salon accounts.
- Seven-day Sanctum token expiry by default; configure SANCTUM_EXPIRATION in minutes.
- Role-aware professional profile creation. Professional profiles begin as pending and are not represented as verified.
- Rate-limited registration and login endpoints.
- National ID verification gateway boundary. The current gateway intentionally returns HTTP 503 because no approved provider or lawful verification agreement has been configured.
- Identity verification attempts and audit events store provider metadata and status only; the raw National ID is not stored.
- Request correlation IDs in the X-Request-ID response header.
- Initial feature tests for customer and stylist registration and the unconfigured identity boundary.

This is an incremental backend foundation, not a production-ready marketplace. Contact verification (email/phone OTP), salon teams, service catalogues, availability, booking transactions, cancellation, notifications, payments, operational hardening, and load testing remain roadmap items.

## Requirements

- PHP 8.3 recommended (PHP 8.2 minimum).
- Composer 2.
- MySQL 8.0+ for development and production.
- PHP extensions: ctype, curl, fileinfo, mbstring, openssl, pdo, pdo_mysql, tokenizer, xml, and json.
- Node.js 20.19+ or 22.12+ for the frontend.

## Local setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Create a MySQL database and a least-privilege application user, then configure DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, and DB_PASSWORD in .env.

```bash
php artisan migrate
php artisan serve
```

The API health endpoint is GET /up. The versioned API base path is /api/v1.

## Authentication contract

Authenticated endpoints require an Authorization: Bearer token header and Accept: application/json. Tokens expire after seven days by default; the expiry is configurable.

### Register

POST /api/v1/auth/register

Customer request:

```json
{
  "name": "Customer name",
  "email": "customer@example.test",
  "phone": "+254700000000",
  "password": "a-long-password",
  "password_confirmation": "a-long-password",
  "role": "customer"
}
```

Stylist or salon requests also supply business_name and location; bio is optional. Roles are strictly customer, stylist, and salon. Passwords must contain at least 12 characters.

Successful registration returns HTTP 201 with data.user, data.token, and data.token_type. The token is returned once and must be held securely by the client. Do not put it in URLs, logs, analytics, or local storage accessible to unrelated scripts. A production React integration should use a carefully reviewed token/session storage strategy and HTTPS.

### Login, current account, logout

- POST /api/v1/auth/login with email and password.
- GET /api/v1/auth/me returns the authenticated account.
- DELETE /api/v1/auth/logout revokes the current Sanctum token.

### Professional identity verification

POST /api/v1/professional/identity-verification (professional account only):

```json
{
  "national_id": "00000000",
  "consent": true
}
```

The number above is a non-real format placeholder only; never use a real identity number in tests, tickets, screenshots, or source control. The current gateway is deliberately unconfigured and returns HTTP 503. It does not claim verification and does not retain the supplied number. Only an approved provider adapter may receive the number over TLS. Persist only the provider reference, verification status, consent-version identifier, and timestamps after the provider contract and privacy review are approved. Never log request bodies for this endpoint.

## Frontend integration

The current React preview uses browser-local JSON state and email lookup; it is not yet connected to this API. Configure the frontend public environment variable after the API is deployed:

```env
VITE_API_BASE_URL=https://api.example.invalid/api/v1
```

The frontend adapter must map API user and professional profile fields to the existing Customer and Professional view models. Do not treat the current local profile ID or local booking records as server identities. A dedicated migration/adapter step is required before enabling live customer registration or booking in the UI.

## Security and operations

- Keep .env, database credentials, app keys, provider credentials, tokens, and all personal data out of Git.
- Use HTTPS, a dedicated MySQL user, managed secrets, encrypted backups, least privilege, and restricted database/network access.
- Set APP_DEBUG=false in every shared environment.
- Configure a shared Redis cache and durable queue before running multiple application instances.
- Review Kenyan data-protection obligations and complete a provider/data-processing agreement before enabling identity verification.
- Contact ownership verification and account recovery must be completed before launch.
- Do not use the placeholder domain or example credentials in deployment.
- Generate and commit composer.lock through the approved dependency update process before production deployment.

## Next backend milestones

1. Salon ownership, team invitations, staff roles, and service catalogue management.
2. Business hours, staff schedules, time off, and server-side availability.
3. Transactional booking creation with a per-professional/day lock and overlap checks in MySQL.
4. Customer booking history, provider decisions, cancellation rules, and audit events.
5. Notification queue and delivery adapters; payment provider boundary and reconciliation.
6. Expanded authorization, abuse controls, integration tests, CI dependency lock, deployment runbooks, observability, backups, and load testing.
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
- Salon team invitations with 72-hour expiry, single-use SHA-256 token-hash storage, SMTP email delivery, and owner-only team administration.
- Team membership roles (manager, stylist, receptionist), invitation acceptance, role updates, suspension, and audit events.
- Provider-owned service catalogues with KES minor-unit pricing, durations, buffers, optional salon staff assignments, and archive semantics.
- Public paginated service discovery and owner-scoped service create/update/archive endpoints; publishing is blocked until the professional profile is verified.
- API rate limits: 5 authentication attempts/minute, 3 identity requests/minute, and 120 API requests/minute per account or IP.
- Salon team invitations with expiring single-use tokens, SHA-256 token-hash storage, email delivery through configured SMTP, and owner-only team administration.
- Team roles (manager, stylist, receptionist), membership suspension, and salon ownership checks.
- Provider-owned service catalogues with integer minor-unit pricing, durations, buffers, active/archive status, and optional salon team assignment.
- Public paginated service discovery and owner-scoped service create/update/archive endpoints.
- Audit events for invitation and service/team changes.

This is an incremental backend foundation, not a production-ready marketplace. Team role labels are recorded but do not yet grant manager/receptionist privileges; salon management endpoints remain owner-only. Contact verification (email/phone OTP), business hours, staff schedules, server-side availability, transactional booking, cancellation, booking notifications, payments, operational hardening, and load testing remain roadmap items.

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
composer test
php artisan serve
```

The API health endpoint is GET /up. The versioned API base path is /api/v1. Configure a real SMTP relay before using salon invitations; the local environment template points to a development SMTP listener on port 1025.

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


## Salon teams and service catalogue

All authenticated routes use Sanctum bearer tokens. A salon owner must have a salon account and its associated salon professional profile. A team invitee must register an independent stylist account using the exact invited email before accepting an invitation.

### Salon team API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /api/v1/salon/team | Salon owner | List team members |
| POST | /api/v1/salon/team/invitations | Salon owner | Invite a team member by email |
| POST | /api/v1/salon/team/invitations/accept | Stylist | Accept a matching invitation |
| PATCH | /api/v1/salon/team/{member}/role | Salon owner | Change manager/stylist/receptionist role |
| DELETE | /api/v1/salon/team/{member} | Salon owner | Suspend team access |

Invitation request:

~~~json
{
  "email": "stylist@example.test",
  "role": "stylist"
}
~~~

Invitations expire after 72 hours. A cryptographically random token is emailed to the invitee; only its SHA-256 hash is stored. The API response never returns the raw token. Invitation creation returns HTTP 503 and creates no invitation when MAIL_MAILER is not smtp or delivery fails. Do not switch the mailer to log in an environment where invitations are enabled because invitation links are credentials.

The invitation link targets FRONTEND_URL/team/invitations/accept?token=... . The React route that consumes this link still needs to be implemented before the invitation journey is complete. The invitee must authenticate as a stylist and submit the token to the acceptance endpoint.

### Service catalogue API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /api/v1/professionals/{professionalProfileId}/services | Public | Paginated active services |
| POST | /api/v1/professional/services | Stylist or salon owner | Create service |
| PATCH | /api/v1/professional/services/{serviceId} | Owning professional | Update service |
| DELETE | /api/v1/professional/services/{serviceId} | Owning professional | Archive service |

Create request:

~~~json
{
  "name": "Protective braids",
  "category": "Braids",
  "description": "A professional protective styling appointment.",
  "price_minor": 250000,
  "duration_minutes": 120,
  "buffer_before_minutes": 10,
  "buffer_after_minutes": 15,
  "is_active": true,
  "requires_consultation": false,
  "team_member_ids": []
}
~~~

price_minor is an integer in the smallest unit of the selected currency. For KES, 250000 represents KES 2,500.00. The API currently accepts KES only. The frontend should convert the integer to its display amount by dividing by 100; never use floating-point arithmetic for server-side money calculations. Salon services may optionally list active team member IDs. Every assigned member must belong to the owning salon. Independent stylist services cannot have team assignments.

A DELETE request archives the service by setting is_active=false; it does not physically delete historical service data. Public discovery returns active services only and uses page-based pagination (50 records per page). New services default to inactive. An owner must have a verified professional profile before setting is_active=true; public discovery also filters out unverified profiles. The current identity-verification gateway is unavailable, so live publication remains blocked until an approved provider is configured.

### SMTP configuration

Set these variables in the backend runtime environment using credentials from an approved mail provider:

~~~env
MAIL_MAILER=smtp
MAIL_SCHEME=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-smtp-password
MAIL_FROM_ADDRESS=no-reply@your-owned-domain
MAIL_FROM_NAME="TOVU"
FRONTEND_URL=https://your-frontend-domain
~~~

Use TLS as required by the provider (typically port 587 with SMTP STARTTLS or port 465 with SMTPS). Store credentials in the deployment secret manager, not in .env.example, CI YAML, or source control. Verify SPF, DKIM, and DMARC for the sender domain before production email delivery.


## Frontend integration

The current React preview uses browser-local JSON state and email lookup; it is not yet connected to this API. Configure the frontend public environment variable after the API is deployed:

```env
VITE_API_BASE_URL=https://api.example.invalid/api/v1
```

The frontend adapter must map API user and professional profile fields to the existing Customer and Professional view models. Do not treat the current local profile ID or local booking records as server identities. A dedicated migration/adapter step is required before enabling live customer registration or booking in the UI.


## Cache and queue scaling

The backend configuration supports Redis-backed cache and queues while retaining file/sync defaults for local development. The database queue tables and failed-job table are included for environments that intentionally choose the database queue.

For a horizontally scaled deployment, install and enable the PHP Redis extension (phpredis) and set the following runtime variables through the secret manager:

~~~env
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=phpredis
REDIS_HOST=your-private-redis-host
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=your-managed-redis-password
REDIS_DB=0
REDIS_CACHE_DB=1
REDIS_QUEUE=default
REDIS_QUEUE_RETRY_AFTER=90
~~~

Keep Redis on a private network, require authentication/TLS where supported, and do not expose it publicly. Use separate logical Redis databases for application cache and queue data. Queue connections use after-commit semantics so jobs are not published before their database transaction commits.

Run a supervised worker process in each application environment:

~~~bash
php artisan queue:work redis --queue=default --sleep=1 --tries=3 --timeout=60
~~~

Use Supervisor, systemd, or an orchestrator to restart workers and gracefully terminate them during deployments. Monitor queue depth, failed jobs, worker memory, latency, and retry rates. Team invitation email is currently sent synchronously so a failed SMTP delivery can roll back invitation creation; future booking notifications should use the durable queue.


## Security and operations

- Keep .env, database credentials, app keys, provider credentials, tokens, and all personal data out of Git.
- Use HTTPS, a dedicated MySQL user, managed secrets, encrypted backups, least privilege, and restricted database/network access.
- Set APP_DEBUG=false in every shared environment.
- Configure the Redis cache and queue drivers before running multiple application instances. The current local defaults (file cache and sync queue) are not cross-instance rate-limit or background-job infrastructure; use Redis for horizontally scaled production deployments.
- Review Kenyan data-protection obligations and complete a provider/data-processing agreement before enabling identity verification.
- Contact ownership verification and account recovery must be completed before launch.
- Do not use the placeholder domain or example credentials in deployment.
- Generate and commit composer.lock through the approved dependency update process before production deployment.

## Next backend milestones

1. Business hours, staff schedules, time off, and server-side availability for independent stylists and salon team members.
2. Transactional booking creation with MySQL conflict prevention, booking history, cancellation rules, and audit events.
3. Booking lifecycle notifications, durable queue configuration, retry policies, and delivery monitoring.
4. Payment-provider contract, webhook signature validation, idempotency, and reconciliation without storing card data.
5. Frontend API adapter and invitation acceptance route; contact verification and account recovery.
6. Expanded authorization, integration tests, dependency lock, deployment runbooks, observability, backups, and load testing.
# TOVU — Hair & Beauty Marketplace

**Your hair. Your style. Your moment.**

TOVU is a premium hair and beauty discovery and appointment-booking experience designed for customers, independent stylists, and salons. The initial product direction is Kenya-first, with a responsive web interface and a local JSON-backed preview workflow.

> **Current status:** Interactive frontend preview. The professional directory starts empty so no fabricated salons, stylists, prices, reviews, or bookings are presented as real. The style gallery contains editorial inspiration references. This is not yet a production multi-user booking service.

## Current functionality

### Customer experience
- Premium landing page and service discovery.
- Search and filter professionals by name, service, provider type, and location.
- Browse salon and independent stylist profiles after they register.
- Explore a visual style inspiration gallery using editorial reference imagery.
- Request appointments by service, date, and time.
- View guest booking requests in the current browser.
- Create a local customer profile and review its booking history.

### Stylist and salon experience
- Register as an independent stylist or salon / beauty business.
- Kenyan National ID number is required as the registration qualification field.
- Create a public professional profile.
- Publish services with category, description, price, and duration.
- Review appointment requests.
- Confirm, decline, and mark appointments as completed.
- View a business overview with booking and service counts.

### JSON data management
- Versioned JSON data model for customers, professionals, services, and bookings.
- Automatic browser persistence using `localStorage`.
- Export the current database as a JSON backup.
- Import a previously exported TOVU JSON backup.

**Important storage limitation:** Browser storage is local to the device and browser profile. It does not synchronize records between different customers, devices, or salons. Clearing browser data can remove locally stored records. Export backups regularly. A shared production marketplace requires a central API and database.

**Identity and privacy limitation:** The professional registration form validates the format of a Kenyan National ID number, but this frontend preview deliberately does not retain the ID number. It records only that the ID field was supplied. No identity, qualification, business, or regulatory verification takes place. Production registration must use secure server-side processing, lawful data handling, and an approved verification workflow. Never collect or store sensitive identity numbers in browser local storage.

**Authentication limitation:** Local profile access uses an email lookup in the current browser. It is a demonstration workflow, not secure authentication. Production must implement secure server-side authentication, password or passkey handling, sessions, authorization, and audit controls.

**Booking limitation:** Appointment requests are stored locally and a basic same-time conflict check is applied in the current browser. There is no server-side availability lock, payment processing, SMS/email notification, or cross-device synchronization yet. Production booking integrity must be enforced by the backend.

## Technology

- React 19
- TypeScript
- Vite
- Lucide React
- Framer Motion
- React Router (available for route expansion)
- Zustand (available for shared state expansion)

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
git clone https://github.com/kisilumueti/tovu-hair-beauty.git
cd tovu-hair-beauty
npm install
npm run dev
```

Open the local URL printed by Vite.

Production build:

```bash
npm run typecheck
npm run build
npm run preview
```

## Project structure

```text
tovu-hair-beauty/
├── public/
├── src/
│   ├── App.tsx          # Marketplace screens and interactions
│   ├── data.ts          # Clearly labelled preview catalogue and style ideas
│   ├── storage.ts       # Versioned JSON local persistence and backup
│   ├── types.ts         # Domain contracts
│   ├── main.tsx
│   └── index.css        # Responsive premium design system
├── .env.example
├── index.html
├── package.json
└── README.md
```

## Visual identity

| Token | Value |
|---|---|
| Espresso | `#171411` |
| Champagne | `#D7B98E` |
| Ivory | `#F5E9D5` |
| Rosewood | `#A47767` |
| Paper | `#FBF9F5` |

The interface uses responsive layouts, accessible labels, keyboard focus states, and reduced-motion support.

## Production roadmap

- [ ] Replace local profile lookup with secure authentication and role-based authorization.
- [ ] Build a Laravel REST API and MySQL persistence layer.
- [ ] Add server-side National ID verification through a lawful, approved provider/process.
- [ ] Add salon ownership, team member invitations, and staff scheduling.
- [ ] Implement recurring business hours, time-off, and service-specific availability.
- [ ] Enforce overlapping appointment prevention with database transactions and locking.
- [ ] Add customer and professional notifications.
- [ ] Integrate a payment provider and payment reconciliation.
- [ ] Add image upload, moderation, and portfolio management.
- [ ] Add reviews with verified-booking eligibility.
- [ ] Add automated tests, CI, monitoring, backups, and deployment controls.
- [ ] Load-test the API and database for the target scale of 100,000+ accounts.

## Security principles

- Do not commit API keys, passwords, access tokens, identity records, or customer data.
- Enforce authorization and validation on the server.
- Store identity data only when legally necessary, with encryption, retention controls, and strict access restrictions.
- Never trust client-side booking availability or price values.
- Keep payment card data out of TOVU systems; use a compliant payment provider.
- Apply rate limiting, audit logging, backup, and recovery controls.

## License

All rights reserved. No open-source license has been assigned.

---

**TOVU — Your hair. Your style. Your moment.**

# TOVU — Hair & Beauty Booking Platform

**Your hair. Your style. Your moment.**

TOVU is a modern hair and beauty discovery and appointment-booking platform designed to connect customers with professional hairstylists, independent beauty professionals, and salons.

Our mission is to simplify how people discover beauty services, explore styles, compare prices, and book appointments while empowering beauty professionals to grow their businesses through digital technology.

**Initial market:** Kenya  
**Platform:** Responsive Web Application  
**Project status:** Frontend Development — Initial Stage

---

## 1. Vision

To build a trusted digital marketplace where customers can discover and book quality hair and beauty services while professionals manage their businesses, clients, services, and appointments from one platform.

## 2. Platform Users

### Customers
- Discover salons and independent hairstylists.
- Search by location, service, and professional.
- Explore hairstyle portfolios and inspiration.
- Compare service descriptions and prices.
- Select preferred professionals.
- Book and manage appointments.
- View appointment history.
- Submit reviews and ratings.

### Independent Stylists
- Create professional profiles.
- Upload hairstyle portfolios.
- Publish services and pricing.
- Configure working hours and availability.
- Accept, manage, and track appointments.
- Build a professional customer base.
- Manage customer reviews.

### Salons and Beauty Businesses
- Create salon business profiles.
- Register and manage team members.
- Publish service catalogues.
- Configure service prices and durations.
- Manage staff availability.
- Monitor appointments and business activity.
- Access operational dashboards.

## 3. Core Features

| Feature | Description |
|---|---|
| Discovery | Search for salons and professionals |
| Service catalogue | Browse services, descriptions, and prices |
| Portfolio | View professional hairstyle galleries |
| Booking | Select services, professionals, dates, and times |
| Availability | Manage professional schedules |
| Customer accounts | Manage profiles and bookings |
| Professional dashboard | Manage services and appointments |
| Salon management | Manage teams, services, and bookings |
| Reviews | Customer feedback and ratings |
| Notifications | Appointment confirmations and reminders |

## 4. Technology Stack

The initial frontend architecture will use:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons
- Framer Motion
- Zustand

### Planned Backend Architecture

- Laravel REST API
- PHP 8.3+
- MySQL
- Role-based access control
- Secure authentication
- API validation and rate limiting
- Payment gateway integration
- Notification services

The architecture will be designed to support growth beyond 100,000 registered users through modular services, optimized database access, caching, and scalable infrastructure.

## 5. Design System

TOVU will use a premium, contemporary beauty-focused visual identity.

| Colour | Hex |
|---|---|
| Espresso | #171411 |
| Champagne | #D7B98E |
| Ivory | #F5E9D5 |
| Rosewood | #A47767 |
| White | #FFFFFF |

### Design Principles
- Mobile-first responsive design.
- Premium editorial presentation.
- Smooth, purposeful animations.
- Accessible navigation and controls.
- Consistent typography and spacing.
- Fast-loading pages and optimized imagery.
- Clear booking and conversion experiences.

## 6. Planned Frontend Structure

```text
tovu-hair-beauty/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.svg
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── booking/
│   │   ├── salon/
│   │   └── stylist/
│   │
│   ├── features/
│   │   ├── authentication/
│   │   ├── discovery/
│   │   ├── appointments/
│   │   ├── customers/
│   │   ├── professionals/
│   │   └── salons/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── Explore/
│   │   ├── Services/
│   │   ├── Stylists/
│   │   ├── Salons/
│   │   ├── Booking/
│   │   ├── Profile/
│   │   └── Dashboard/
│   │
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## 7. Development Roadmap

- [ ] Initialize React and TypeScript.
- [ ] Establish the design system.
- [ ] Build responsive navigation and application layout.
- [ ] Develop the landing page.
- [ ] Build service discovery and search.
- [ ] Develop stylist profiles and portfolios.
- [ ] Develop salon profiles.
- [ ] Build the appointment booking interface.
- [ ] Implement customer dashboards.
- [ ] Implement professional dashboards.
- [ ] Integrate Laravel API.
- [ ] Implement authentication and authorization.
- [ ] Integrate payment processing.
- [ ] Implement appointment notifications.
- [ ] Add automated tests.
- [ ] Prepare production deployment.

## 8. Security and Reliability

Security will be incorporated throughout development.

- Secure authentication and session management.
- Server-side authorization.
- Input validation and sanitization.
- Protection against common web vulnerabilities.
- Secure payment integration.
- API rate limiting.
- Audit logging for sensitive operations.
- Protection of customer and business information.
- Server-authoritative appointment availability.
- Database backup and recovery strategy.

No real customer records, passwords, API credentials, or production secrets should be committed to this repository.

## 9. Development Philosophy

TOVU will be built as a production-oriented platform rather than a static demonstration.

Development priorities:

1. Clean and maintainable architecture.
2. Reusable components.
3. Strong TypeScript contracts.
4. Responsive and accessible interfaces.
5. Performance optimization.
6. Reliable booking workflows.
7. Secure API integration.
8. Long-term scalability.

Any preview content must be clearly identified as sample content rather than presented as real platform listings or live bookings.

## 10. License

All rights reserved. No open-source license has currently been assigned to this project.

---

**TOVU — Your hair. Your style. Your moment.**

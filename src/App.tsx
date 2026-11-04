import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown, Download,
  Heart, LogOut, MapPin, Menu, Plus, Search, ShieldCheck, SlidersHorizontal,
  Sparkles, Upload, UserRound, X,
} from 'lucide-react';
import { inspirationLooks } from './data';
import { createId, exportDatabase, importDatabase, loadDatabase, saveDatabase } from './storage';
import type { AccountRole, Booking, BookingStatus, Customer, Professional, Service, TovuDatabase } from './types';

type Page = 'home' | 'explore' | 'inspiration' | 'bookings' | 'dashboard';
type Modal = 'account' | 'booking' | 'service' | null;

const money = (amount: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
const today = () => { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

function App() {
  const [db, setDb] = useState<TovuDatabase>(() => loadDatabase());
  const [page, setPage] = useState<Page>('home');
  const [modal, setModal] = useState<Modal>(null);
  const [currentUser, setCurrentUser] = useState<Customer | null>(() => {
    try {
      const id = localStorage.getItem('tovu.active.profile');
      return id ? loadDatabase().customers.find((customer) => customer.id === id) ?? null : null;
    } catch { return null; }
  });
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All services');
  const [roleFilter, setRoleFilter] = useState('All providers');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => { saveDatabase(db); }, [db]);

  const providers = useMemo(() => db.professionals.filter((provider) => {
    const matchesText = [provider.name, provider.businessName, provider.location, provider.bio, ...provider.services].join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = provider.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesRole = roleFilter === 'All providers' || provider.role === roleFilter;
    const matchesCategory = categoryFilter === 'All services' || provider.services.some((service) => service.toLowerCase().includes(categoryFilter.toLowerCase())) || db.services.some((service) => service.professionalId === provider.id && service.category === categoryFilter);
    return matchesText && matchesLocation && matchesRole && matchesCategory;
  }), [db.professionals, db.services, searchTerm, locationFilter, roleFilter, categoryFilter]);

  const ownBookings = useMemo(() => {
    if (!currentUser) return db.bookings.filter((booking) => booking.customerId === 'guest');
    if (currentUser.role === 'customer') return db.bookings.filter((booking) => booking.customerId === currentUser.id);
    return db.bookings.filter((booking) => booking.professionalId === currentUser.id);
  }, [currentUser, db.bookings]);

  const ownProvider = currentUser && currentUser.role !== 'customer'
    ? db.professionals.find((provider) => provider.id === currentUser.id) ?? null
    : null;

  const navigate = (next: Page) => {
    setPage(next);
    setMobileMenu(false);
    setModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 4200);
  };

  const openBooking = (provider: Professional, service?: Service) => {
    setSelectedProfessional(provider);
    setSelectedService(service ?? db.services.find((item) => item.professionalId === provider.id) ?? null);
    setError('');
    setModal('booking');
  };

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const role = String(form.get('role')) as AccountRole;
    const name = String(form.get('name')).trim();
    const email = String(form.get('email')).trim().toLowerCase();
    const phone = String(form.get('phone')).trim();
    const location = String(form.get('location')).trim();
    const nationalId = String(form.get('nationalId') ?? '').trim();

    if (!name || !email || !phone || !location) { setError('Complete all required fields.'); return; }
    if (db.customers.some((customer) => customer.email === email)) { setError('An account with this email already exists in this browser.'); return; }
    if (role !== 'customer' && !/^\d{7,8}$/.test(nationalId)) { setError('Enter a valid 7–8 digit Kenyan National ID number.'); return; }

    const id = createId(role);
    const customer: Customer = { id, name, email, phone, location, role, createdAt: new Date().toISOString() };
    let nextDb: TovuDatabase = { ...db, customers: [...db.customers, customer] };

    if (role !== 'customer') {
      const businessName = String(form.get('businessName')).trim();
      const bio = String(form.get('bio')).trim();
      const provider: Professional = {
        id, role, name, businessName: businessName || name, email, phone, location,
        bio: bio || 'New TOVU professional. Profile information coming soon.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        cover: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=900&q=80',
        services: [], priceFrom: 0, verified: false, createdAt: new Date().toISOString(), idProvided: true,
      };
      nextDb = { ...nextDb, professionals: [...nextDb.professionals, provider] };
    }

    // The ID is validated as a registration requirement but is deliberately not persisted in browser storage.
    setDb(nextDb);
    setCurrentUser(customer);
    localStorage.setItem('tovu.active.profile', customer.id);
    setError('');
    setModal(null);
    notify(role === 'customer' ? 'Your customer profile is ready.' : 'Your professional profile is registered. Add your first service in the dashboard.');
    if (role === 'customer') navigate('bookings'); else navigate('dashboard');
  };


  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('loginEmail')).trim().toLowerCase();
    const existing = db.customers.find((customer) => customer.email === email);
    if (!existing) { setError('No local profile was found for that email on this browser. Create a new profile instead.'); return; }
    setCurrentUser(existing);
    localStorage.setItem('tovu.active.profile', existing.id);
    setError('');
    setModal(null);
    notify(`Welcome back, ${existing.name.split(' ')[0]}.`);
    navigate(existing.role === 'customer' ? 'bookings' : 'dashboard');
  };

  const handleBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProfessional || !selectedService) { setError('Choose a service before booking.'); return; }
    const form = new FormData(event.currentTarget);
    const customerName = String(form.get('customerName')).trim();
    const customerPhone = String(form.get('customerPhone')).trim();
    const date = String(form.get('date'));
    const time = String(form.get('time'));
    if (!customerName || !customerPhone || !date || !time) { setError('Complete all booking details.'); return; }
    if (date < today()) { setError('Choose a future date.'); return; }
    const requestedStart = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
    const requestedEnd = requestedStart + selectedService.durationMinutes;
    const conflict = db.bookings.some((booking) => {
      if (booking.professionalId !== selectedProfessional.id || booking.date !== date || booking.status === 'cancelled') return false;
      const existingStart = Number(booking.time.slice(0, 2)) * 60 + Number(booking.time.slice(3, 5));
      const existingDuration = db.services.find((service) => service.id === booking.serviceId)?.durationMinutes ?? 60;
      const existingEnd = existingStart + existingDuration;
      return requestedStart < existingEnd && existingStart < requestedEnd;
    });
    if (conflict) { setError('That appointment overlaps an existing request. Please choose another time.'); return; }

    const booking: Booking = {
      id: createId('booking'), customerId: currentUser?.id ?? 'guest',
      customerName, customerPhone, professionalId: selectedProfessional.id,
      professionalName: selectedProfessional.businessName, serviceId: selectedService.id,
      serviceName: selectedService.name, date, time, price: selectedService.price,
      notes: String(form.get('notes') ?? '').trim(), status: 'pending', createdAt: new Date().toISOString(),
    };
    setDb({ ...db, bookings: [booking, ...db.bookings] });
    setModal(null);
    setError('');
    notify('Booking request saved. The provider must confirm it.');
    navigate('bookings');
  };

  const updateBooking = (id: string, status: BookingStatus) => {
    setDb({ ...db, bookings: db.bookings.map((booking) => booking.id === id ? { ...booking, status } : booking) });
    notify(`Booking marked as ${status}.`);
  };

  const addService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ownProvider) return;
    const form = new FormData(event.currentTarget);
    const price = Number(form.get('price'));
    const duration = Number(form.get('duration'));
    const service: Service = {
      id: createId('service'), professionalId: ownProvider.id,
      name: String(form.get('name')).trim(), description: String(form.get('description')).trim(),
      category: String(form.get('category')), price, durationMinutes: duration,
    };
    if (!service.name || !Number.isFinite(price) || price < 0 || !Number.isFinite(duration) || duration < 15) { setError('Enter a service name, valid price and duration of at least 15 minutes.'); return; }
    setDb({ ...db, services: [...db.services, service], professionals: db.professionals.map((provider) => provider.id === ownProvider.id ? { ...provider, services: [...provider.services, service.name], priceFrom: provider.priceFrom ? Math.min(provider.priceFrom, price) : price } : provider) });
    setModal(null);
    setError('');
    notify('Your service has been published to this browser catalogue.');
  };


  const removeService = (serviceId: string) => {
    if (!ownProvider || !window.confirm('Remove this service from your public catalogue?')) return;
    const remaining = db.services.filter((service) => service.id !== serviceId);
    const providerServices = remaining.filter((service) => service.professionalId === ownProvider.id);
    setDb({
      ...db,
      services: remaining,
      professionals: db.professionals.map((provider) => provider.id === ownProvider.id
        ? { ...provider, services: providerServices.map((service) => service.name), priceFrom: providerServices.length ? Math.min(...providerServices.map((service) => service.price)) : 0 }
        : provider),
    });
    notify('Service removed from your catalogue.');
  };

  const signOut = () => {
    localStorage.removeItem('tovu.active.profile');
    setCurrentUser(null);
    navigate('home');
    notify('You have signed out of this local preview.');
  };

  const handleImport = async (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    try {
      const imported = await importDatabase(file);
      setDb(imported);
      setCurrentUser(null);
      localStorage.removeItem('tovu.active.profile');
      notify('TOVU JSON backup imported successfully.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not import this backup.');
    }
  };

  return (
    <div className="tovu-app">
      <div className="top-ribbon"><span className="ribbon-dot" /> THE TOVU PREVIEW EXPERIENCE <span className="ribbon-divider">·</span> DISCOVER YOUR NEXT LOOK</div>
      <header className="app-header">
        <button className="wordmark" onClick={() => navigate('home')} aria-label="TOVU home"><span className="wordmark-icon">T</span><span>TOVU<span className="wordmark-period">.</span></span></button>
        <nav className={mobileMenu ? 'app-nav app-nav-open' : 'app-nav'} aria-label="Main navigation">
          <button className={page === 'explore' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('explore')}>Find a professional</button>
          <button className={page === 'inspiration' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('inspiration')}>Style inspiration</button>
          <button className={page === 'bookings' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('bookings')}>My bookings</button>
          {currentUser && currentUser.role !== 'customer' && <button className={page === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('dashboard')}>Business studio</button>}
        </nav>
        <div className="header-controls">
          {currentUser ? <button className="profile-chip" onClick={() => navigate(currentUser.role === 'customer' ? 'bookings' : 'dashboard')}><span className="profile-avatar">{currentUser.name.slice(0, 1).toUpperCase()}</span><span>{currentUser.name.split(' ')[0]}</span><ChevronDown size={14} /></button><button className="button button-quiet signout-button" onClick={signOut} title="Sign out"><LogOut size={14} /></button> : <button className="button button-quiet" onClick={() => { setModal('account'); setShowRegister(true); }}>Sign in / Join</button>}
          <button className="button button-ink header-join" onClick={() => { setModal('account'); setShowRegister(true); }}>Join TOVU <ArrowUpRight size={15} /></button>
        </div>
        <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">{mobileMenu ? <X /> : <Menu />}</button>
      </header>

      {notice && <div className="toast"><Check size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={14} /></button></div>}
      {error && !modal && <div className="global-error"><span>{error}</span><button onClick={() => setError('')}><X size={14} /></button></div>}

      {page === 'home' && (
        <>
          <section className="market-hero">
            <div className="hero-grain" />
            <div className="market-hero-copy">
              <div className="overline"><span /> THE ART OF LOOKING LIKE YOU</div>
              <h1>Find your look.<br /><em>Love your moment.</em></h1>
              <p>Discover exceptional hair and beauty professionals around you. Explore the work, choose your service, and make your next appointment feel effortless.</p>
              <div className="hero-cta-row"><button className="button button-gold" onClick={() => navigate('explore')}>Explore professionals <ArrowRight size={16} /></button><button className="button button-outline-light" onClick={() => navigate('inspiration')}>Explore style ideas <Sparkles size={15} /></button></div>
              <div className="hero-microcopy"><span><ShieldCheck size={15} /> Profiles and services in one place</span><span><CalendarDays size={15} /> Appointment requests made simple</span></div>
            </div>
            <div className="hero-photo-wrap"><img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=90" alt="Editorial hair styling inspiration" /><div className="hero-photo-label"><span>THE BEAUTY EDIT</span><span>01 — 06</span></div><div className="hero-photo-stamp">YOUR<br /><i>moment</i><br />starts here</div></div>
            <div className="hero-foot"><span>NAIROBI · KENYA</span><span>BEAUTY, ON YOUR TERMS</span><button onClick={() => navigate('explore')}>SCROLL TO DISCOVER ↓</button></div>
          </section>

          <section className="quick-search section-shell">
            <div className="quick-search-intro"><span className="eyebrow">A BETTER BEAUTY SEARCH</span><h2>What are we<br /><em>booking today?</em></h2></div>
            <div className="quick-search-controls">
              <label><span>SERVICE</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All services</option><option>Hair styling</option><option>Braids & locs</option><option>Hair care</option><option>Makeup</option><option>Nails & beauty</option></select></label>
              <label><span>LOCATION</span><input value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="e.g. Kilimani, Nairobi" /></label>
              <button className="button button-ink" onClick={() => navigate('explore')}>Search <Search size={16} /></button>
            </div>
          </section>

          <section className="section-shell feature-section">
            <div className="section-heading"><div><span className="eyebrow">THE TOVU DISCOVERY EDIT</span><h2>Find the right hands<br /><em>for your next look.</em></h2></div><button className="text-link" onClick={() => navigate('explore')}>View all professionals <ArrowUpRight size={15} /></button></div>
            <div className="provider-grid">
              {db.professionals.slice(0, 3).map((provider) => <ProviderCard key={provider.id} provider={provider} services={db.services.filter((service) => service.professionalId === provider.id)} onBook={openBooking} onOpen={() => { setSelectedProfessional(provider); navigate('explore'); }} />)}
            </div>
          </section>

          <section className="inspiration-band">
            <div className="inspiration-band-copy"><span className="eyebrow light-eyebrow">A LITTLE INSPIRATION</span><h2>Save the look.<br /><em>Make it yours.</em></h2><p>Explore ideas for your next appointment, then find a professional who can help bring your vision to life.</p><button className="button button-gold" onClick={() => navigate('inspiration')}>Explore the style gallery <ArrowRight size={16} /></button></div>
            <div className="inspiration-mini-grid">{inspirationLooks.slice(0, 3).map((look) => <button key={look.id} onClick={() => navigate('inspiration')}><img src={look.image} alt={look.title} /><span>{look.title}</span></button>)}</div>
          </section>

          <section className="how-section section-shell">
            <div className="section-heading"><div><span className="eyebrow">A SIMPLE WAY TO FEEL YOUR BEST</span><h2>Three steps.<br /><em>One lovely experience.</em></h2></div><p>From inspiration to appointment, TOVU brings your beauty journey into one place.</p></div>
            <div className="steps-grid"><article><span>01</span><Search /><h3>Discover</h3><p>Explore professionals, services, locations and style inspiration.</p></article><article><span>02</span><CalendarDays /><h3>Choose your moment</h3><p>Select a service, request a date and time, and share your preferences.</p></article><article><span>03</span><Heart /><h3>Enjoy your look</h3><p>Keep your appointment details together and return whenever you're ready.</p></article></div>
          </section>

          <section className="professional-callout"><div><span className="eyebrow">FOR STYLISTS & SALON OWNERS</span><h2>Your craft deserves<br /><em>a beautiful stage.</em></h2><p>Create a professional profile, publish services and start receiving appointment requests.</p></div><button className="button button-ink" onClick={() => { setModal('account'); setShowRegister(true); }}>Register your business <ArrowUpRight size={16} /></button></section>
          <Footer onNavigate={navigate} />
        </>
      )}

      {page === 'explore' && (
        <main className="page-shell">
          <div className="page-intro"><span className="eyebrow">THE TOVU DIRECTORY</span><h1>Meet your next<br /><em>beauty professional.</em></h1><p>Explore the directory, compare services and find a professional whose work feels right for you.</p></div>
          <div className="directory-toolbar"><div className="directory-search"><Search size={17} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search names, services or locations" /></div><div className="filter-control"><SlidersHorizontal size={15} /><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option>All providers</option><option value="stylist">Independent stylists</option><option value="salon">Salons</option></select></div><select className="filter-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All services</option><option>Hair styling</option><option>Braids & locs</option><option>Hair care</option><option>Makeup</option><option>Nails & beauty</option></select><input className="location-filter" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Location" /></div>
          <div className="directory-meta"><span>{providers.length} {providers.length === 1 ? 'professional' : 'professionals'} found</span><span>Preview directory · listings marked as sample are illustrative</span></div>
          {providers.length ? <div className="provider-grid directory-grid">{providers.map((provider) => <ProviderCard key={provider.id} provider={provider} services={db.services.filter((service) => service.professionalId === provider.id)} onBook={openBooking} onOpen={() => setSelectedProfessional(provider)} />)}</div> : <EmptyState title="No professionals found" text="Try a different search term, service or location." action="Clear filters" onAction={() => { setSearchTerm(''); setLocationFilter(''); setCategoryFilter('All services'); setRoleFilter('All providers'); }} />}
          {selectedProfessional && <div className="profile-detail"><button className="close-detail" onClick={() => setSelectedProfessional(null)}><X size={16} /></button><img src={selectedProfessional.cover} alt="" /><div><span className="eyebrow">PROFESSIONAL PROFILE</span><h2>{selectedProfessional.businessName}</h2><p>{selectedProfessional.bio}</p><p className="detail-location"><MapPin size={14} />{selectedProfessional.location}</p><div className="detail-services">{db.services.filter((service) => service.professionalId === selectedProfessional.id).map((service) => <button key={service.id} onClick={() => openBooking(selectedProfessional, service)}><span><strong>{service.name}</strong><small>{service.durationMinutes} min</small></span><b>{money(service.price)}</b><ArrowUpRight size={15} /></button>)}</div></div></div>}
        </main>
      )}

      {page === 'inspiration' && (
        <main className="page-shell">
          <div className="page-intro"><span className="eyebrow">THE TOVU STYLE JOURNAL</span><h1>A moodboard for<br /><em>your next moment.</em></h1><p>Browse editorial hairstyle and beauty ideas. These images are inspiration references, not portfolios or work samples from registered TOVU professionals.</p></div>
          <div className="inspiration-grid">{inspirationLooks.map((look, index) => <article className={index % 3 === 0 ? 'look-card look-tall' : 'look-card'} key={look.id}><div className="look-image"><img src={look.image} alt={look.title} loading="lazy" /><span className="look-category">{look.category}</span><button aria-label={`Book a style like ${look.title}`} onClick={() => { setSearchTerm(look.category); setCategoryFilter(look.category === 'Braids' ? 'Braids & locs' : 'All services'); navigate('explore'); }}><ArrowUpRight size={17} /></button></div><div className="look-caption"><div><h3>{look.title}</h3><p>{look.note}</p></div><span>0{index + 1}</span></div></article>)}</div>
          <div className="inspiration-note"><Sparkles size={18} /><p>Found your look? Explore the TOVU directory to discover a professional and request an appointment.</p><button className="button button-ink" onClick={() => navigate('explore')}>Find a professional <ArrowRight size={15} /></button></div>
        </main>
      )}

      {page === 'bookings' && (
        <main className="page-shell">
          <div className="page-intro dashboard-intro"><span className="eyebrow">YOUR TOVU SPACE</span><h1>{currentUser ? 'Your appointments.' : 'Your next appointment.'}<br /><em>All in one place.</em></h1><p>{currentUser ? `Welcome back, ${currentUser.name}. Here are the appointments connected to this local profile.` : 'You can request a booking without creating an account. Register to keep a local customer profile and view your bookings here.'}</p></div>
          {!currentUser && <div className="account-prompt"><UserRound size={21} /><div><strong>Want to keep track of your appointments?</strong><p>Create a customer profile on this device to keep your booking history together.</p></div><button className="button button-ink" onClick={() => { setModal('account'); setShowRegister(true); }}>Create profile</button></div>}
          <div className="booking-list">{ownBookings.length ? ownBookings.map((booking) => <BookingRow key={booking.id} booking={booking} onUpdate={updateBooking} customerView={currentUser?.role === 'customer' || booking.customerId === 'guest'} />) : <EmptyState title="No appointments yet" text="Your booking requests will appear here after you choose a professional and service." action="Explore professionals" onAction={() => navigate('explore')} />}</div>
          {db.bookings.some((booking) => booking.customerId === 'guest') && <p className="local-note">Guest booking requests are stored on this browser. Create a profile before your next booking to associate future appointments with your account.</p>}
        </main>
      )}

      {page === 'dashboard' && (
        <main className="page-shell">
          {!ownProvider ? <div className="empty-state"><UserRound size={28} /><h2>Professional studio</h2><p>Register as a stylist or salon to access your business workspace.</p><button className="button button-ink" onClick={() => { setModal('account'); setShowRegister(true); }}>Register as a professional</button></div> : <>
            <div className="dashboard-welcome"><div><span className="eyebrow">TOVU BUSINESS STUDIO</span><h1>Welcome, <em>{ownProvider.businessName}.</em></h1><p>Manage your services and appointment requests from one workspace.</p></div><button className="button button-outline-dark" onClick={() => setModal('service')}><Plus size={16} /> Add a service</button></div>
            <div className="stats-grid"><div><span>TOTAL REQUESTS</span><strong>{ownBookings.length}</strong><small>All booking statuses</small></div><div><span>PENDING</span><strong>{ownBookings.filter((booking) => booking.status === 'pending').length}</strong><small>Awaiting your response</small></div><div><span>CONFIRMED</span><strong>{ownBookings.filter((booking) => booking.status === 'confirmed').length}</strong><small>Upcoming appointments</small></div><div><span>LIVE SERVICES</span><strong>{db.services.filter((service) => service.professionalId === ownProvider.id).length}</strong><small>Your catalogue</small></div></div>
            <section className="dashboard-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR CATALOGUE</span><h2>Services & pricing</h2></div><button className="button button-quiet" onClick={() => setModal('service')}><Plus size={15} /> Add service</button></div>
              {db.services.filter((service) => service.professionalId === ownProvider.id).length ? <div className="service-manage-list">{db.services.filter((service) => service.professionalId === ownProvider.id).map((service) => <div key={service.id}><div><strong>{service.name}</strong><span>{service.category} · {service.durationMinutes} minutes</span></div><b>{money(service.price)}</b><button className="remove-service" onClick={() => removeService(service.id)}>Remove</button></div>)}</div> : <EmptyState title="Your catalogue is ready for its first service" text="Add a service so customers can understand what you offer and request an appointment." action="Add your first service" onAction={() => setModal('service')} />}
            </section>
            <section className="dashboard-panel"><div className="panel-heading"><div><span className="eyebrow">CLIENT MANAGEMENT</span><h2>Appointment requests</h2></div><span className="panel-count">{ownBookings.length} total</span></div>
              {ownBookings.length ? <div className="booking-list compact-bookings">{ownBookings.map((booking) => <BookingRow key={booking.id} booking={booking} onUpdate={updateBooking} customerView={false} />)}</div> : <EmptyState title="No appointment requests yet" text="When customers request your services, they will appear here." />}
            </section>
            <section className="dashboard-panel profile-settings"><div className="panel-heading"><div><span className="eyebrow">PUBLIC PROFILE</span><h2>Business details</h2></div><span className="status-pill status-pending">ID supplied · Not verified</span></div><p>{ownProvider.bio}</p><p><MapPin size={14} /> {ownProvider.location}</p><p><ShieldCheck size={14} /> ID number was required at registration but is not retained in this browser preview. Identity and professional verification are not performed here.</p></section>
          </>}
        </main>
      )}

      {page !== 'home' && <Footer onNavigate={navigate} />}

      {modal === 'account' && <ModalShell title={showRegister ? 'Create your TOVU profile' : 'Welcome to TOVU'} subtitle="Set up a local preview profile to explore the customer or professional experience." onClose={() => { setModal(null); setError(''); }}>
        {showRegister ? <form className="form-stack" onSubmit={handleRegister}>
          <div className="form-callout"><ShieldCheck size={18} /><span>This preview stores profile details in this browser only. It does not create a secure online account.</span></div>
          <label>ACCOUNT TYPE<select name="role" defaultValue="customer"><option value="customer">Customer</option><option value="stylist">Independent stylist</option><option value="salon">Salon / beauty business</option></select></label>
          <label>FULL NAME<input name="name" required placeholder="Your full name" /></label>
          <label>EMAIL ADDRESS<input name="email" type="email" required placeholder="you@example.com" /></label>
          <div className="form-two"><label>PHONE NUMBER<input name="phone" type="tel" required placeholder="+254 7XX XXX XXX" /></label><label>LOCATION<input name="location" required placeholder="Town / neighbourhood" /></label></div>
          <label>BUSINESS / STUDIO NAME <span className="optional-label">For professionals</span><input name="businessName" placeholder="Your salon or studio name" /></label>
          <label>ABOUT YOUR WORK <span className="optional-label">For professionals</span><textarea name="bio" rows={3} placeholder="Tell customers about your services and experience." /></label>
          <label>NATIONAL ID NUMBER <span className="required-label">Required for stylist and salon registration</span><input name="nationalId" inputMode="numeric" pattern="[0-9]{7,8}" maxLength={8} placeholder="7–8 digit Kenyan ID number" /><small className="field-help">The number is checked for format and immediately discarded. It is not saved. This preview does not verify identity or qualifications.</small></label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-ink button-full" type="submit">Create local profile <ArrowRight size={16} /></button>
          <p className="form-footnote">By continuing, you understand this is a browser-based product preview, not a live identity or authentication service.</p>
          <button type="button" className="form-switch" onClick={() => { setShowRegister(false); setError(''); }}>Already have a local profile? Sign in</button>
        </form> : <form className="form-stack" onSubmit={handleLogin}>
          <div className="form-callout"><UserRound size={18} /><span>Sign in to a profile previously created in this same browser. This is local preview access, not secure authentication.</span></div>
          <label>EMAIL ADDRESS<input name="loginEmail" type="email" required placeholder="you@example.com" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-ink button-full" type="submit">Open my profile <ArrowRight size={16} /></button>
          <button type="button" className="form-switch" onClick={() => { setShowRegister(true); setError(''); }}>New to TOVU? Create a profile</button>
        </form>}
      </ModalShell>}

      {modal === 'booking' && selectedProfessional && selectedService && <ModalShell title="Request an appointment" subtitle={`Booking with ${selectedProfessional.businessName}`} onClose={() => { setModal(null); setError(''); }}>
        <form className="form-stack" onSubmit={handleBooking}>
          <div className="booking-service-summary"><img src={selectedProfessional.avatar} alt="" /><div><strong>{selectedService.name}</strong><span>{selectedProfessional.businessName} · {selectedProfessional.location}</span><small>{selectedService.durationMinutes} minutes</small></div><b>{money(selectedService.price)}</b></div>
          <label>YOUR NAME<input name="customerName" required defaultValue={currentUser?.name ?? ''} placeholder="Full name" /></label>
          <label>PHONE NUMBER<input name="customerPhone" required defaultValue={currentUser?.phone ?? ''} placeholder="+254 7XX XXX XXX" /></label>
          <div className="form-two"><label>DATE<input name="date" type="date" min={today()} required /></label><label>TIME<select name="time" required defaultValue=""><option value="" disabled>Select a time</option>{['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map((time) => <option key={time}>{time}</option>)}</select></label></div>
          <label>NOTES FOR THE PROFESSIONAL<textarea name="notes" rows={3} placeholder="Share preferences, hair length, inspiration or other details." /></label>
          <div className="form-callout"><CalendarDays size={18} /><span>This creates a pending request in this browser. The professional must confirm it. No payment is taken in this preview.</span></div>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-ink button-full" type="submit">Send booking request <ArrowRight size={16} /></button>
        </form>
      </ModalShell>}

      {modal === 'service' && <ModalShell title="Publish a service" subtitle="Add a service to your professional catalogue." onClose={() => { setModal(null); setError(''); }}>
        <form className="form-stack" onSubmit={addService}>
          <label>SERVICE NAME<input name="name" required placeholder="e.g. Knotless braids" /></label>
          <label>CATEGORY<select name="category"><option>Hair styling</option><option>Braids & locs</option><option>Hair care</option><option>Makeup</option><option>Nails & beauty</option></select></label>
          <label>DESCRIPTION<textarea name="description" rows={3} required placeholder="Describe what's included in this service." /></label>
          <div className="form-two"><label>PRICE (KES)<input name="price" type="number" min="0" step="50" required placeholder="2500" /></label><label>DURATION (MINUTES)<input name="duration" type="number" min="15" step="15" required placeholder="90" /></label></div>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-ink button-full" type="submit">Publish service <Check size={16} /></button>
        </form>
      </ModalShell>}

      <div className="data-tools"><button onClick={() => exportDatabase(db)} title="Download a JSON backup"><Download size={14} /> Export JSON</button><label title="Restore a TOVU JSON backup"><Upload size={14} /> Import JSON<input type="file" accept="application/json,.json" onChange={handleImport} /></label></div>
    </div>
  );
}

function ProviderCard({ provider, services, onBook, onOpen }: { provider: Professional; services: Service[]; onBook: (provider: Professional, service?: Service) => void; onOpen: () => void }) {
  return <article className="provider-card">
    <button className="provider-cover" onClick={onOpen}><img src={provider.cover} alt={`Editorial image for ${provider.businessName}`} loading="lazy" /><span className="sample-tag">PREVIEW LISTING</span><span className="provider-type">{provider.role === 'salon' ? 'SALON' : 'INDEPENDENT STYLIST'}</span></button>
    <div className="provider-info"><div className="provider-heading"><div><h3>{provider.businessName}</h3><span>{provider.name}</span></div><span className="provider-avatar"><img src={provider.avatar} alt="" /></span></div><p className="provider-location"><MapPin size={13} />{provider.location}</p><p className="provider-bio">{provider.bio}</p><div className="provider-tags">{provider.services.slice(0, 3).map((service) => <span key={service}>{service}</span>)}</div><div className="provider-card-footer"><span>From <strong>{provider.priceFrom ? money(provider.priceFrom) : 'Set your prices'}</strong></span>{services.length ? <button onClick={() => onBook(provider, services[0])}>Book now <ArrowUpRight size={14} /></button> : <button onClick={onOpen}>View profile <ArrowUpRight size={14} /></button>}</div></div>
  </article>;
}

function BookingRow({ booking, onUpdate, customerView }: { booking: Booking; onUpdate: (id: string, status: BookingStatus) => void; customerView: boolean }) {
  return <article className="booking-row"><div className="booking-date"><strong>{new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-KE', { day: '2-digit' })}</strong><span>{new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-KE', { month: 'short' })}</span></div><div className="booking-main"><strong>{booking.serviceName}</strong><span>{customerView ? booking.professionalName : booking.customerName} · {booking.date} at {booking.time}</span><small>{booking.customerPhone}</small>{booking.notes && <small>Note: {booking.notes}</small>}</div><div className="booking-actions"><b>{money(booking.price)}</b><span className={`status-pill status-${booking.status}`}>{booking.status}</span>{!customerView && booking.status === 'pending' && <div><button onClick={() => onUpdate(booking.id, 'confirmed')}>Confirm</button><button onClick={() => onUpdate(booking.id, 'cancelled')}>Decline</button></div>}{!customerView && booking.status === 'confirmed' && <button onClick={() => onUpdate(booking.id, 'completed')}>Mark completed</button>}{customerView && booking.status === 'pending' && <button onClick={() => onUpdate(booking.id, 'cancelled')}>Cancel request</button>}</div></article>;
}

function EmptyState({ title, text, action, onAction }: { title: string; text: string; action?: string; onAction?: () => void }) {
  return <div className="empty-state"><CalendarDays size={27} /><h2>{title}</h2><p>{text}</p>{action && onAction && <button className="button button-ink" onClick={onAction}>{action} <ArrowRight size={15} /></button>}</div>;
}

function ModalShell({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-label={title}><div className="modal-header"><div><span className="eyebrow">TOVU · YOUR NEXT CHAPTER</span><h2>{title}</h2><p>{subtitle}</p></div><button onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div>{children}</section></div>;
}

function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return <footer className="app-footer"><button className="wordmark footer-wordmark" onClick={() => onNavigate('home')}><span className="wordmark-icon">T</span><span>TOVU<span className="wordmark-period">.</span></span></button><p>Your hair. Your style. Your moment.</p><div><button onClick={() => onNavigate('explore')}>Directory</button><button onClick={() => onNavigate('inspiration')}>Style journal</button><button onClick={() => onNavigate('bookings')}>Appointments</button></div><small>© {new Date().getFullYear()} TOVU · Product preview. Sample listings are illustrative.</small></footer>;
}

export default App;

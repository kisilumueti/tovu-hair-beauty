import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, CalendarDays, ChevronDown,
  Menu, Search, ShieldCheck, Sparkles, X,
} from 'lucide-react';

const serviceCategories = [
  { number: '01', name: 'Hair styling', detail: 'Cuts, silk press, blowouts and more', icon: '✳' },
  { number: '02', name: 'Braids & locs', detail: 'Protective styles, twists and loc care', icon: '〰' },
  { number: '03', name: 'Nails & beauty', detail: 'Manicures, pedicures and finishing touches', icon: '◇' },
  { number: '04', name: 'Makeup', detail: 'Everyday looks and special occasions', icon: '✧' },
];

const trustPoints = [
  { icon: ShieldCheck, title: 'Professionals you can explore', text: 'Review profiles, services and portfolios before you decide.' },
  { icon: CalendarDays, title: 'Appointments on your time', text: 'A clearer way to find a service and request a suitable time.' },
  { icon: Sparkles, title: 'Your style, your choice', text: 'Discover the right beauty experience for your next moment.' },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [service, setService] = useState('All services');
  const [location, setLocation] = useState('');

  const closeMenu = () => setMobileOpen(false);
  const startDiscovery = () => {
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
    closeMenu();
  };

  return (
    <main>
      <div className="announcement">
        <span className="announcement-dot" />
        A new way to find your beauty professional.
        <a href="#discover">Discover TOVU <ArrowUpRight size={13} /></a>
      </div>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="TOVU home">
          <span className="brand-mark">T</span>
          <span className="brand-name">TOVU<span>.</span></span>
        </a>

        <nav className={mobileOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
          <a href="#discover" onClick={closeMenu}>Discover</a>
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#professionals" onClick={closeMenu}>For professionals</a>
          <div className="mobile-nav-actions">
            <button className="button button-outline" onClick={startDiscovery}>Explore services</button>
          </div>
        </nav>

        <div className="header-actions">
          <a className="sign-in" href="mailto:hello@tovu.co.ke?subject=TOVU%20early%20access">Get in touch</a>
          <button className="button button-dark header-cta" onClick={startDiscovery}>Find your style <ArrowUpRight size={15} /></button>
        </div>
        <button className="menu-toggle" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span /> THE BEAUTY EXPERIENCE, REIMAGINED</div>
          <h1>Your next look<br />starts <em>here.</em></h1>
          <p className="hero-description">Good hair days should be easier to find. Discover talented beauty professionals, explore their work, and make room for a little more you.</p>
          <div className="hero-actions">
            <button className="button button-dark button-large" onClick={startDiscovery}>Explore services <ArrowRight size={17} /></button>
            <a className="text-link" href="#how-it-works">How TOVU works <ArrowUpRight size={15} /></a>
          </div>
          <div className="hero-note">
            <div className="note-icon"><Sparkles size={17} /></div>
            <div><strong>A more thoughtful way to book.</strong><span>Made around your time, taste and style.</span></div>
          </div>
        </div>
        <div className="hero-visual" aria-label="Editorial beauty photography">
          <div className="hero-image" />
          <div className="image-caption"><span>THE ART OF YOUR EVERYDAY</span><span>01 / 04</span></div>
          <div className="floating-card">
            <span className="floating-icon"><CalendarDays size={18} /></span>
            <div><strong>Your time, beautifully spent.</strong><span>Discover. Choose. Connect.</span></div>
            <ArrowUpRight size={17} />
          </div>
          <div className="vertical-label">BEAUTY, ON YOUR TERMS</div>
        </div>
        <div className="hero-bottomline"><span>NAIROBI · KENYA</span><span>FIND YOUR FEEL-GOOD</span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section className="discover-section section-pad" id="discover">
        <div className="section-heading">
          <div><div className="eyebrow"><span /> YOUR SEARCH STARTS HERE</div><h2>Find the feeling.<br /><em>Find your people.</em></h2></div>
          <p>Whether you know exactly what you want or you're ready for something new, your next beauty experience is a few steps away.</p>
        </div>
        <div className="search-panel">
          <div className="search-field service-select">
            <label htmlFor="service-select">I'M LOOKING FOR</label>
            <div className="select-wrap"><Sparkles size={17} /><select id="service-select" value={service} onChange={(event) => setService(event.target.value)}><option>All services</option><option>Hair styling</option><option>Braids & locs</option><option>Nails & beauty</option><option>Makeup</option></select><ChevronDown size={15} /></div>
          </div>
          <div className="search-divider" />
          <div className="search-field location-field">
            <label htmlFor="location-input">MY LOCATION</label>
            <div className="select-wrap"><Search size={17} /><input id="location-input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter a town or neighbourhood" /></div>
          </div>
          <button className="button button-dark search-button" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>Explore <ArrowRight size={17} /></button>
        </div>
        <p className="search-disclaimer">Discovery is being built. Search selections are not yet connected to live salon listings.</p>
      </section>

      <section className="services-section section-pad" id="services">
        <div className="section-heading compact">
          <div><div className="eyebrow"><span /> EXPLORE THE POSSIBILITIES</div><h2>Whatever your style,<br /><em>there's a place for it.</em></h2></div>
          <a className="text-link" href="#professionals">For beauty professionals <ArrowUpRight size={15} /></a>
        </div>
        <div className="service-grid">
          {serviceCategories.map((item) => (
            <motion.button className="service-card" key={item.number} whileHover={{ y: -5 }} onClick={() => { setService(item.name); document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <span className="service-number">{item.number}</span>
              <span className="service-symbol">{item.icon}</span>
              <span className="service-card-bottom"><strong>{item.name}</strong><small>{item.detail}</small><span className="service-arrow"><ArrowUpRight size={18} /></span></span>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="manifesto" id="how-it-works">
        <div className="manifesto-image" role="img" aria-label="Warm editorial beauty studio interior" />
        <div className="manifesto-copy">
          <div className="eyebrow light"><span /> A LITTLE MORE YOU</div>
          <h2>Beauty is personal.<br /><em>Finding it should be simple.</em></h2>
          <p>TOVU is being created to bring discovery and booking into one considered experience. Less guesswork, more confidence, and more time for the things that make you feel like yourself.</p>
          <a href="#discover" className="button button-light">Explore the experience <ArrowRight size={16} /></a>
        </div>
      </section>

      <section className="benefits-section section-pad" id="professionals">
        <div className="section-heading compact">
          <div><div className="eyebrow"><span /> THE TOVU DIFFERENCE</div><h2>Made for the way<br /><em>you do beauty.</em></h2></div>
          <p>A thoughtful experience for customers and the talented people behind every great look.</p>
        </div>
        <div className="benefit-grid">
          {trustPoints.map(({ icon: Icon, title, text }, index) => (
            <article className="benefit-card" key={title}><span className="benefit-index">0{index + 1}</span><Icon size={23} strokeWidth={1.5} /><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
        <div className="professional-banner">
          <div><span className="eyebrow">FOR STYLISTS & SALONS</span><h3>Your talent deserves<br /><em>to be discovered.</em></h3><p>We're shaping a better digital home for beauty professionals.</p></div>
          <a className="button button-dark" href="mailto:hello@tovu.co.ke?subject=I%20want%20to%20join%20TOVU">Join the conversation <ArrowUpRight size={16} /></a>
        </div>
      </section>

      <section className="closing-cta">
        <div className="eyebrow light"><span /> THE NEXT CHAPTER OF BEAUTY</div>
        <h2>Make time for<br /><em>feeling like you.</em></h2>
        <a className="button button-light button-large" href="mailto:hello@tovu.co.ke?subject=TOVU%20early%20access">Stay connected <ArrowUpRight size={17} /></a>
        <span className="closing-sparkle">✳</span>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home"><span className="brand-mark">T</span><span className="brand-name">TOVU<span>.</span></span></a>
        <span className="footer-tagline">Your hair. Your style. Your moment.</span>
        <div className="footer-links"><a href="#discover">Discover</a><a href="#services">Services</a><a href="#professionals">For professionals</a><a href="mailto:hello@tovu.co.ke">Contact</a></div>
        <span className="copyright">© {new Date().getFullYear()} TOVU. All rights reserved.</span>
      </footer>
    </main>
  );
}

export default App;
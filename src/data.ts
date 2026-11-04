import type { Professional, Service } from './types';

export const sampleProfessionals: Professional[] = [
  {
    id: 'sample-stylist-01', role: 'stylist', name: 'Amara Njeri', businessName: 'Amara Hair Studio',
    email: 'amara.preview@example.test', phone: '+254700000101', location: 'Westlands, Nairobi',
    bio: 'A preview profile showcasing natural hair care, silk press styling and protective looks.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85',
    cover: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85',
    services: ['Silk press', 'Natural hair care', 'Blowout'], priceFrom: 1800, verified: false, createdAt: '2026-01-10T09:00:00.000Z', idProvided: false,
  },
  {
    id: 'sample-salon-02', role: 'salon', name: 'TOVU Preview Team', businessName: 'The Mane Atelier',
    email: 'atelier.preview@example.test', phone: '+254700000102', location: 'Kilimani, Nairobi',
    bio: 'An editorial sample salon profile for exploring the TOVU booking experience.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=85',
    cover: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=900&q=85',
    services: ['Knotless braids', 'Cornrows', 'Wash and treatment'], priceFrom: 2500, verified: false, createdAt: '2026-01-10T09:00:00.000Z', idProvided: false,
  },
  {
    id: 'sample-stylist-03', role: 'stylist', name: 'Zuri Wambui', businessName: 'Zuri Braids & Locs',
    email: 'zuri.preview@example.test', phone: '+254700000103', location: 'Lavington, Nairobi',
    bio: 'Preview profile featuring protective styling, knotless braids and loc maintenance.',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=85',
    cover: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=900&q=85',
    services: ['Knotless braids', 'Boho braids', 'Loc retwist'], priceFrom: 3000, verified: false, createdAt: '2026-01-10T09:00:00.000Z', idProvided: false,
  },
  {
    id: 'sample-salon-04', role: 'salon', name: 'TOVU Preview Team', businessName: 'Maison Beauty House',
    email: 'maison.preview@example.test', phone: '+254700000104', location: 'Karen, Nairobi',
    bio: 'A sample multi-service beauty destination for testing salon discovery and bookings.',
    avatar: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=300&q=85',
    cover: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=85',
    services: ['Makeup', 'Nails', 'Hair styling'], priceFrom: 2200, verified: false, createdAt: '2026-01-10T09:00:00.000Z', idProvided: false,
  },
  {
    id: 'sample-stylist-05', role: 'stylist', name: 'Nia Achieng', businessName: 'Nia Natural Beauty',
    email: 'nia.preview@example.test', phone: '+254700000105', location: 'Runda, Nairobi',
    bio: 'Preview profile for natural hair consultations, twists and healthy hair routines.',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=85',
    cover: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08a2?auto=format&fit=crop&w=900&q=85',
    services: ['Two-strand twists', 'Hair treatment', 'Wash day'], priceFrom: 1500, verified: false, createdAt: '2026-01-10T09:00:00.000Z', idProvided: false,
  },
  {
    id: 'sample-salon-06', role: 'salon', name: 'TOVU Preview Team', businessName: 'Studio Sanaa',
    email: 'sanaa.preview@example.test', phone: '+254700000106', location: 'Kileleshwa, Nairobi',
    bio: 'Sample salon profile for a premium beauty and occasion styling experience.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=85',
    cover: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=85',
    services: ['Bridal styling', 'Event makeup', 'Blowout'], priceFrom: 3500, verified: false, createdAt: '2026-01-10T09:00:00.000Z', idProvided: false,
  },
];

export const sampleServices: Service[] = [
  { id: 'sample-service-01', professionalId: 'sample-stylist-01', name: 'Silk press', description: 'Cleanse, condition and smooth natural hair with a polished finish.', category: 'Hair styling', price: 2500, durationMinutes: 120 },
  { id: 'sample-service-02', professionalId: 'sample-stylist-01', name: 'Wash and treatment', description: 'A restorative wash-day experience with deep conditioning.', category: 'Hair care', price: 1800, durationMinutes: 75 },
  { id: 'sample-service-03', professionalId: 'sample-salon-02', name: 'Medium knotless braids', description: 'Protective knotless braid styling. Hair extensions may be quoted separately.', category: 'Braids & locs', price: 6500, durationMinutes: 240 },
  { id: 'sample-service-04', professionalId: 'sample-salon-02', name: 'Cornrows', description: 'Neat cornrow styling with a consultation on preferred pattern.', category: 'Braids & locs', price: 2500, durationMinutes: 120 },
  { id: 'sample-service-05', professionalId: 'sample-stylist-03', name: 'Boho knotless braids', description: 'Bohemian knotless braids with a soft, textured finish.', category: 'Braids & locs', price: 8500, durationMinutes: 300 },
  { id: 'sample-service-06', professionalId: 'sample-stylist-03', name: 'Loc retwist', description: 'A maintenance session for established locs.', category: 'Hair care', price: 3500, durationMinutes: 150 },
  { id: 'sample-service-07', professionalId: 'sample-salon-04', name: 'Soft glam makeup', description: 'A refined makeup look for events and special occasions.', category: 'Makeup', price: 4000, durationMinutes: 90 },
  { id: 'sample-service-08', professionalId: 'sample-salon-04', name: 'Classic manicure', description: 'Nail shaping, cuticle care and a polished finish.', category: 'Nails & beauty', price: 1800, durationMinutes: 60 },
  { id: 'sample-service-09', professionalId: 'sample-stylist-05', name: 'Two-strand twists', description: 'A defined twist style for natural hair.', category: 'Hair styling', price: 2200, durationMinutes: 120 },
  { id: 'sample-service-10', professionalId: 'sample-salon-06', name: 'Occasion styling', description: 'A tailored hair styling session for your special event.', category: 'Hair styling', price: 4500, durationMinutes: 120 },
];

export const inspirationLooks = [
  { id: 'look-01', title: 'Boho knotless braids', category: 'Braids', image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=700&q=85', note: 'Soft texture, effortless movement' },
  { id: 'look-02', title: 'Natural curls', category: 'Natural hair', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=85', note: 'Defined shape and healthy volume' },
  { id: 'look-03', title: 'Sleek low bun', category: 'Updos', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85', note: 'Minimal, elegant and timeless' },
  { id: 'look-04', title: 'Protective twists', category: 'Protective styles', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=700&q=85', note: 'A versatile everyday statement' },
  { id: 'look-05', title: 'Silk press finish', category: 'Hair styling', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=85', note: 'Smooth, glossy and polished' },
  { id: 'look-06', title: 'Soft glam', category: 'Makeup', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=85', note: 'A softly defined occasion look' },
];
export type AccountRole = 'customer' | 'stylist' | 'salon';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Professional {
  id: string;
  role: 'stylist' | 'salon';
  name: string;
  businessName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  cover: string;
  services: string[];
  priceFrom: number;
  verified: boolean;
  createdAt: string;
  idProvided: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: AccountRole;
  createdAt: string;
}

export interface Service {
  id: string;
  professionalId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  notes: string;
  status: BookingStatus;
  createdAt: string;
}

export interface TovuDatabase {
  version: 1;
  customers: Customer[];
  professionals: Professional[];
  services: Service[];
  bookings: Booking[];
}
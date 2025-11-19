export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Core Data Models for Glo Nail SaaS
export interface Manicurist {
  id: string;
  name: string;
  email: string;
  // other profile details
}
export interface Service {
  id: string;
  manicuristId: string; // To associate service with a manicurist
  name: string;
  description: string;
  duration: number; // in minutes
  price: number; // in cents to avoid floating point issues
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY'; // Example currencies
}
export interface Client {
  id: string;
  name: string;
  email: string;
  manicuristId: string; // Link to their specific manicurist
  loyaltyProgress?: number;
  totalAppointments?: number;
  targetAppointments?: number;
}
export interface Appointment {
  id:string;
  clientId: string;
  manicuristId: string;
  serviceId: string;
  startTime: string; // ISO 8601 format
  endTime: string;   // ISO 8601 format
  status: 'scheduled' | 'completed' | 'cancelled';
}
export interface RewardsProgram {
  id: string;
  manicuristId: string;
  name: string;
  targetAppointments: number;
  rewardDescription: string;
}
export interface Availability {
    id: string; // e.g., 'monday'
    manicuristId: string;
    dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime?: string; // e.g., "09:00"
    endTime?: string;   // e.g., "17:00"
    isEnabled: boolean;
}
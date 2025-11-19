import { IndexedEntity } from "./core-utils";
import type { Service, Availability, Appointment, RewardsProgram, Client, Manicurist, Subscription } from "@shared/types";
import { addYears } from 'date-fns';
// MANICURIST ENTITY
export class ManicuristEntity extends IndexedEntity<Manicurist> {
    static readonly entityName = "manicurist";
    static readonly indexName = "manicurists";
    static readonly initialState: Manicurist = {
        id: "",
        name: "",
        email: "",
        status: "active",
        registrationDate: new Date().toISOString(),
    };
    static readonly seedData: ReadonlyArray<Manicurist> = [
        { id: 'mock-manicurist-id', name: 'Alice Wonder', email: 'alice@example.com', status: 'active', registrationDate: '2023-10-01T10:00:00Z' },
        { id: 'manicurist-2', name: 'Bella Ciao', email: 'bella@example.com', status: 'active', registrationDate: '2023-11-15T14:30:00Z' },
        { id: 'manicurist-3', name: 'Carla Smith', email: 'carla@example.com', status: 'disabled', registrationDate: '2023-12-20T09:00:00Z' },
    ];
}
// SERVICE ENTITY
export class ServiceEntity extends IndexedEntity<Service> {
  static readonly entityName = "service";
  static readonly indexName = "services";
  static readonly initialState: Service = {
    id: "",
    manicuristId: "",
    name: "",
    description: "",
    duration: 30,
    price: 0,
    currency: "USD",
  };
}
// AVAILABILITY ENTITY
export class AvailabilityEntity extends IndexedEntity<Availability> {
    static readonly entityName = "availability";
    static readonly indexName = "availabilities";
    static readonly initialState: Availability = {
        id: "",
        manicuristId: "",
        dayOfWeek: "monday",
        startTime: "09:00",
        endTime: "17:00",
        isEnabled: false,
    };
}
// APPOINTMENT ENTITY
export class AppointmentEntity extends IndexedEntity<Appointment> {
    static readonly entityName = "appointment";
    static readonly indexName = "appointments";
    static readonly initialState: Appointment = {
        id: "",
        clientId: "",
        manicuristId: "",
        serviceId: "",
        startTime: "",
        endTime: "",
        status: "scheduled",
    };
}
// REWARDS PROGRAM ENTITY
export class RewardsProgramEntity extends IndexedEntity<RewardsProgram> {
    static readonly entityName = "rewards_program";
    static readonly indexName = "rewards_programs";
    static readonly initialState: RewardsProgram = {
        id: "",
        manicuristId: "",
        name: "Loyalty Program",
        targetAppointments: 10,
        rewardDescription: "50% off next service",
    };
}
// CLIENT ENTITY
export class ClientEntity extends IndexedEntity<Client> {
    static readonly entityName = "client";
    static readonly indexName = "clients";
    static readonly initialState: Client = {
        id: "",
        name: "",
        email: "",
        manicuristId: "",
    };
    static readonly seedData: ReadonlyArray<Client> = [
        { id: 'mock-client-id', name: 'Jane Doe', email: 'jane.doe@example.com', manicuristId: 'mock-manicurist-id' },
        { id: 'mock-client-id-2', name: 'John Smith', email: 'john.smith@example.com', manicuristId: 'mock-manicurist-id' },
        { id: 'client-3', name: 'Sam Wilson', email: 'sam.w@example.com', manicuristId: 'manicurist-2' },
    ];
}
// SUBSCRIPTION ENTITY
export class SubscriptionEntity extends IndexedEntity<Subscription> {
    static readonly entityName = "subscription";
    static readonly indexName = "subscriptions";
    static readonly initialState: Subscription = {
        id: "",
        manicuristId: "",
        plan: "solo_artist",
        status: "active",
        startDate: new Date().toISOString(),
        endDate: addYears(new Date(), 1).toISOString(),
    };
    static readonly seedData: ReadonlyArray<Subscription> = [
        { id: 'sub-1', manicuristId: 'mock-manicurist-id', plan: 'solo_artist', status: 'active', startDate: '2023-10-01T10:00:00Z', endDate: '2024-10-01T10:00:00Z' },
        { id: 'sub-2', manicuristId: 'manicurist-2', plan: 'solo_artist', status: 'past_due', startDate: '2023-11-15T14:30:00Z', endDate: '2024-11-15T14:30:00Z' },
        { id: 'sub-3', manicuristId: 'manicurist-3', plan: 'solo_artist', status: 'cancelled', startDate: '2023-12-20T09:00:00Z', endDate: '2024-12-20T09:00:00Z' },
    ];
}
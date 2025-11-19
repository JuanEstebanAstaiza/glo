import { IndexedEntity } from "./core-utils";
import type { Service, Availability, Appointment, RewardsProgram, Client } from "@shared/types";
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
    ];
}
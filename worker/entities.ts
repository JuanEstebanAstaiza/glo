import { IndexedEntity } from "./core-utils";
import type { Service, Availability, Appointment } from "@shared/types";
// SERVICE ENTITY: one DO instance per service
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
// AVAILABILITY ENTITY: one DO instance per day of the week for a manicurist
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
// APPOINTMENT ENTITY: one DO instance per appointment
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
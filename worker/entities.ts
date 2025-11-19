import { IndexedEntity } from "./core-utils";
import type { Service } from "@shared/types";
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
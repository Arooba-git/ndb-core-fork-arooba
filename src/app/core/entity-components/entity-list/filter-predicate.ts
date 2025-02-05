import { Entity } from "../../entity/model/entity";
import { getReadableValue } from "../entity-subrecord/entity-subrecord/value-accessor";

export function entityFilterPredicate(data: Entity, filter: string): boolean {
  return [...Object.values(data)].some((value) =>
    String(getReadableValue(value)).toLowerCase().includes(filter)
  );
}

import { ColumnSettings } from "./ColumnSettings";

export function RemoveColumnByField(
  fieldName: string,
  columns: ColumnSettings[]
): ColumnSettings[] {
  const items = [...columns];
  items.splice(
    items.findIndex((f) => f.field === fieldName),
    1
  );
  return items;
}

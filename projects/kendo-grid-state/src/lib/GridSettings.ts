import { State, DataResult } from "@progress/kendo-data-query";
import { ColumnSettings } from "./ColumnSettings";


export class GridSettings {
  key: string;
  storage: Storage;
  columns: ColumnSettings[];
  state: State;
  gridData?: DataResult;
  expandedRows?: boolean[];
}

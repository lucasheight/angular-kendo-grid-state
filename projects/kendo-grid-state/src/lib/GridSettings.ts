import { State, DataResult } from "@progress/kendo-data-query";
import { ColumnSettings, Column } from "./ColumnSettings";

export interface IGridState {
  columns: Column[];
  state: State;
  //  gridData?: DataResult;
  expandedRows?: boolean[];
}
export class GridSettings {
  key: string;
  storage: Storage;
  columns: ColumnSettings[];
  state: State;
  gridData?: DataResult;
  expandedRows?: boolean[];
}

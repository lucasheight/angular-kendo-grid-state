import { State, DataResult } from "@progress/kendo-data-query";
import { ColumnSettings } from "./ColumnSettings";
import { GridStorageType } from './GridStorageEnum';

export class GridSettings {
  key: string;
  storage:GridStorageType;
  columns: ColumnSettings[];
  state: State;
  gridData?: DataResult;
  expandedRows?: boolean[];
}

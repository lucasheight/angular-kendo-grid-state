import { State } from "@progress/kendo-data-query";
import { Column } from "./Column";

export interface IGridState {
  columns: Column[];
  state: State;
  //  gridData?: DataResult;
  expandedRows?: boolean[];
}

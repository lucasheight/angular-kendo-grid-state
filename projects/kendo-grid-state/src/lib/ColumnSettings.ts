export interface IColumnSettings {
  field?: string;
  title?: string;
  filter?: "string" | "numeric" | "date" | "boolean";
  editor?: "string" | "numeric" | "date" | "boolean";
  format?: string | object;
  width?: number;
  filterable?: boolean;
  orderIndex?: number;
  media?: string;
  hidden?: boolean;
  editable?: boolean;
  style?: object;
  sortable?: boolean;
}
export class ColumnSettings implements IColumnSettings {
  field? = undefined;
  title? = this.field ? this.field : "";
  hidden? = false;
  editable? = true;
  filterable? = true;
  filter?: "string" | "numeric" | "date" | "boolean";
  editor?: "string" | "numeric" | "date" | "boolean";
  format?: string |object;
  width?: number;
  orderIndex?: number;
  media?: string;
  style?: object;
  sortable?: boolean;

  constructor(settings: IColumnSettings) {
    Object.assign(
      this,
      { filterable: true, hidden: false, editable: true } as IColumnSettings,
      settings
    );
  }
}

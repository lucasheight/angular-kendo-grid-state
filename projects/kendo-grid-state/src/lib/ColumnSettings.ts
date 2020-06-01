/* eslint-disable @typescript-eslint/ban-types */
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
export class Column {
  field? = undefined;
  hidden? = false;
  width?: number;
  expanded?: boolean = false;
}

export class ColumnSettings extends Column implements IColumnSettings {
  title? = this.field ? this.field : "";
  editable? = true;
  filterable? = true;
  filter?: "string" | "numeric" | "date" | "boolean";
  editor?: "string" | "numeric" | "date" | "boolean";
  format?: string | object;

  orderIndex?: number;
  media?: string;
  style?: object;
  sortable?: boolean;

  constructor(settings: IColumnSettings) {
    super();
    Object.assign(
      this,
      { filterable: true, hidden: false, editable: true } as IColumnSettings,
      settings
    );
  }
}

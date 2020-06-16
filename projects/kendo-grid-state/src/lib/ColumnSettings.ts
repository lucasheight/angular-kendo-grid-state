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
  origIdx?: number = 0;
  orderIndex?: number;
  leafIndex?: number;
  hidden? = false;
  width?: number;
  expanded?: boolean = false;
  title?: string;
  field?: string = undefined;
}

export class ColumnSettings extends Column implements IColumnSettings {
  editable?: boolean = true;
  filterable?: boolean = true;
  filter?: "string" | "numeric" | "date" | "boolean";
  editor?: "string" | "numeric" | "date" | "boolean";
  format?: string | object;
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

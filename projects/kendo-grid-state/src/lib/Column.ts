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

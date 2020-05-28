import { Injectable, InjectionToken, Inject } from "@angular/core";
import { GridSettings } from "./GridSettings";
import {
  ColumnVisibilityChangeEvent,
  ColumnComponent,
  ColumnReorderEvent,
  DetailExpandEvent,
  DetailCollapseEvent,
  ColumnResizeArgs,
} from "@progress/kendo-angular-grid";
import { ColumnSettings } from "./ColumnSettings";

export const GRID_STATE = new InjectionToken<GridSettings>("grid.settings");
@Injectable()
export class GridStateService {
  constructor(@Inject(GRID_STATE) private settings: GridSettings) {
    //check if exists, if not store default settings
    if (this.settings.storage.getItem(this.settings.key) === null) {
      this.settings.storage.setItem(
        this.settings.key,
        JSON.stringify(this.settings)
      );
    }
  }

  public get = (): GridSettings => {
    const res = this.settings.storage.getItem(this.settings.key);
    return res ? JSON.parse(res) : res;
  };
  public set = (settings: GridSettings): void => {
    this.settings.storage.setItem(settings.key, JSON.stringify(settings));
  };
  public remove = (settings: GridSettings): void => {
    this.settings.storage.removeItem(settings.key);
  };
  /**
   * Handler for the ColumnVisibilityChangeEvent
   */
  public onVisibilityChange = (e: ColumnVisibilityChangeEvent): void => {
    const existing = this.get();
    e.columns.forEach((col) => {
      existing.columns.find(
        (f) => f.field == (col as ColumnComponent).field
      ).hidden = col.hidden;
    });
    this.set(existing);
  };
  /**
   * Handler for DetailExpandEvent
   */
  public onDetailExpand = (e: DetailExpandEvent): void => {
    const existing = this.get();
    existing.expandedRows[e.index] = true;
    this.set(existing);
  };
  /**
   * Handler for DetailCollapseEvent
   */
  public onDetailCollapse = (e: DetailCollapseEvent): void => {
    const existing = this.get();
    existing.expandedRows[e.index] = false;
    this.set(existing);
  };
  /**
   * Handler for ColumnReorderEvent
   */
  public onColumnReorder = (e: ColumnReorderEvent): void => {
    const existing = this.get();
    //oldIndex does not include hidden columns, need to count for this.
    //1. find the hidden columns and move them to an array with their position index
    const hiddenCols = existing.columns.reduce((acc, curr, idx) => {
      if (curr.hidden) {
        acc[idx] = curr;
      }
      return acc;
    }, []);

    let visibleCols: ColumnSettings[] = existing.columns.filter(
      (f, idx) => f.hidden === undefined || f.hidden === false
    );

    //2. apply the reordering
    const reorderedCol = visibleCols.splice(e.oldIndex, 1);
    visibleCols.splice(e.newIndex, 0, ...reorderedCol);
    //3. Put hidden columns back in with their position, of course it will be slightly out of wack, but hey they were hidden
    hiddenCols.forEach((e, idx) => {
      visibleCols.splice(idx, 0, e);
    });
    existing.columns = visibleCols;
    this.set(existing);
  };
  /**
   * Handler for ColumnResizeEvent
   */
  public onColumnResize = (e: ColumnResizeArgs[]): void => {
    const existing = this.get();
    //find the column
    e.forEach((e) => {
      let found = existing.columns.find(
        (f) => f.field === (e.column as any).field
      );
      if(found){
        found.width = e.newWidth;
      }
    });
    this.set(existing);
  };
}

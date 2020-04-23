import { Injectable, InjectionToken, Inject } from "@angular/core";
import { GridSettings } from "./GridSettings";
import {
  ColumnVisibilityChangeEvent,
  ColumnComponent,
} from "@progress/kendo-angular-grid";
import { GridStorageType } from './GridStorageEnum';

export const GRID_STATE = new InjectionToken<GridSettings>("grid.settings");
@Injectable()
export class GridStateService {
  private storage: Storage;
  constructor(@Inject(GRID_STATE) private settings: GridSettings) {
    if (settings.storage == GridStorageType.Local) {
      this.storage = localStorage;
    }
    else {
      this.storage = sessionStorage;
    }

    //check if exists, if not store default settings
    if (this.storage.getItem(this.settings.key) === null) {
      this.storage.setItem(this.settings.key, JSON.stringify(this.settings));
    }
  }

  public get = (): GridSettings => {
    const res = this.storage.getItem(this.settings.key);
    return res ? JSON.parse(res) : res;
  };
  public set = (settings: GridSettings): void => {
    this.storage.setItem(settings.key, JSON.stringify(settings));
  };
  public remove = (settings: GridSettings): void => {
    this.storage.removeItem(settings.key);
  }

  public onVisibilityChange = (e: ColumnVisibilityChangeEvent): void => {
    const existing = this.get();
    e.columns.forEach((col) => {
      existing.columns.find(
        (f) => f.field == (col as ColumnComponent).field
      ).hidden = col.hidden;
    });
    this.set(existing);
  };
  public onRowExpandchange = (rows: boolean[]): void => {
    const existing = this.get();
    existing.expandedRows = rows;
    this.set(existing);
  };
}

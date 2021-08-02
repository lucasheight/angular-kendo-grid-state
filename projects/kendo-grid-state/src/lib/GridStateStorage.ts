import { InjectionToken } from "@angular/core";

export const GRID_STATE_STORAGE = new InjectionToken("GRID_STATE_STORAGE");

export interface IGridStateStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class GridStateLocalStorage implements IGridStateStorage {
  public getItem(key: string): string {
    return localStorage.getItem(key);
  }
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}

export class GridStateSessionStorage implements IGridStateStorage {
  public getItem(key: string): string {
    return sessionStorage.getItem(key);
  }
  setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }
}

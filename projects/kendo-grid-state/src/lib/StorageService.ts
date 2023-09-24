import { Injectable, Inject } from "@angular/core";
import { APP_STORAGE } from "./AppStorage";

@Injectable({ providedIn: "root" })
export class StorageService {
  constructor(@Inject(APP_STORAGE) private store: Storage) {}
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string {
    return this.store.getItem(key);
  }
  key(index: number): string {
    return this.store.key(index);
  }
  removeItem(key: string): void {
    this.store.removeItem(key);
  }
  setItem(key: string, value: string): void {
    this.store.setItem(key, value);
  }
}

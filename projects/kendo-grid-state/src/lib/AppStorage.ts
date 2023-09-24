import { Inject, Injectable, InjectionToken } from "@angular/core";

export const APP_STORAGE = new InjectionToken<Storage>("App Storage", {
  providedIn: "root",
  factory: () => sessionStorage,
});

import { TestBed } from "@angular/core/testing";
import { APP_STORAGE } from "./AppStorage";
import { StorageService } from "./StorageService";

describe("StorageService", () => {
  describe("with the default provider", () => {
    it("uses sessionStorage", () => {
      TestBed.configureTestingModule({});
      const service = TestBed.inject(StorageService);

      service.setItem("default-provider", "stored");

      expect(sessionStorage.getItem("default-provider")).toBe("stored");
      sessionStorage.removeItem("default-provider");
    });
  });

  describe("with a custom provider", () => {
    let store: Storage;
    let service: StorageService;

    beforeEach(() => {
      store = jasmine.createSpyObj<Storage>("Storage", [
        "clear",
        "getItem",
        "key",
        "removeItem",
        "setItem",
      ]);
      TestBed.configureTestingModule({
        providers: [{ provide: APP_STORAGE, useValue: store }],
      });
      service = TestBed.inject(StorageService);
    });

    it("delegates every call to the injected storage", () => {
      service.setItem("a", "1");
      service.getItem("a");
      service.key(0);
      service.removeItem("a");
      service.clear();

      expect(store.setItem).toHaveBeenCalledWith("a", "1");
      expect(store.getItem).toHaveBeenCalledWith("a");
      expect(store.key).toHaveBeenCalledWith(0);
      expect(store.removeItem).toHaveBeenCalledWith("a");
      expect(store.clear).toHaveBeenCalled();
    });

    it("returns what the injected storage returns", () => {
      (store.getItem as jasmine.Spy).and.returnValue("hello custom storage");

      expect(service.getItem("anything")).toBe("hello custom storage");
    });

    it("passes through a miss from the injected storage", () => {
      (store.getItem as jasmine.Spy).and.returnValue(null);

      expect(service.getItem("missing")).toBeNull();
    });
  });
});

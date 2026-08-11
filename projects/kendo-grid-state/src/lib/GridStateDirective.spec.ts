import { EventEmitter, QueryList } from "@angular/core";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import {
  ColumnBase,
  DataStateChangeEvent,
  DetailCollapseEvent,
  DetailExpandEvent,
  GridComponent,
  RowArgs,
} from "@progress/kendo-angular-grid";
import { APP_STORAGE } from "./AppStorage";
import { Column } from "./Column";
import { IGridState } from "./GridState";
import { GridStateDirective } from "./GridStateDirective";

/**
 * The directive only touches a handful of members on the grid, so a stub keeps
 * these specs focused on the state logic. GridStateDirective.integration.spec.ts
 * exercises the same directive against a real kendo-grid.
 */
class GridStub {
  isDetailExpanded: (args: RowArgs) => boolean = () => false;
  dataStateChange = new EventEmitter<DataStateChangeEvent>();
  detailExpand = new EventEmitter<DetailExpandEvent>();
  detailCollapse = new EventEmitter<DetailCollapseEvent>();
  columns = new QueryList<ColumnBase>();

  setColumns(cols: Partial<ColumnBase>[]): void {
    this.columns.reset(cols as ColumnBase[]);
  }
}

function fakeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length(): number {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? map.get(key) : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => map.delete(key),
    setItem: (key: string, value: string) => map.set(key, value),
  } as Storage;
}

const KEY = "ANiceGrid";

function column(overrides: Partial<Column> = {}): Partial<ColumnBase> {
  return {
    orderIndex: 0,
    leafIndex: 0,
    hidden: false,
    width: 100,
    title: "Product",
    field: "ProductName",
    ...overrides,
  } as Partial<ColumnBase>;
}

describe("GridStateDirective", () => {
  let grid: GridStub;
  let store: Storage;

  function stored(): IGridState {
    return JSON.parse(store.getItem(KEY) as string);
  }

  function newDirective(): GridStateDirective {
    return TestBed.runInInjectionContext(() => new GridStateDirective());
  }

  function createDirective(gridState = KEY): GridStateDirective {
    const directive = newDirective();
    directive.gridState = gridState;
    return directive;
  }

  beforeEach(() => {
    grid = new GridStub();
    store = fakeStorage();
    TestBed.configureTestingModule({
      providers: [
        { provide: GridComponent, useValue: grid },
        { provide: APP_STORAGE, useValue: store },
      ],
    });
  });

  describe("gridState key", () => {
    it("throws when it has not been set", () => {
      const directive = newDirective();

      expect(() => directive.ngOnInit()).toThrow(
        "gridState has not been set, this is required to be unique for each grid as it is used as the storage key",
      );
    });

    it("throws when it is empty", () => {
      const directive = createDirective("");

      expect(() => directive.ngOnInit()).toThrow(
        "gridState has not been set, this is required to be unique for each grid as it is used as the storage key",
      );
    });

    it("is used as the storage key", () => {
      createDirective("SomeOtherGrid").ngOnInit();

      expect(store.getItem("SomeOtherGrid")).not.toBeNull();
      expect(store.getItem(KEY)).toBeNull();
    });

    it("keeps two grids on separate keys", () => {
      const first = createDirective("gridOne");
      const second = createDirective("gridTwo");
      first.skip = 10;
      second.skip = 40;

      first.ngOnInit();
      second.ngOnInit();

      expect(JSON.parse(store.getItem("gridOne") as string).state.skip).toBe(
        10,
      );
      expect(JSON.parse(store.getItem("gridTwo") as string).state.skip).toBe(
        40,
      );
    });
  });

  describe("with no persisted state", () => {
    it("persists the directive's own inputs as the initial state", () => {
      const directive = createDirective();
      directive.skip = 0;
      directive.take = 10;
      directive.group = [{ field: "SupplierID" }];

      directive.ngOnInit();

      expect(stored().state).toEqual(
        jasmine.objectContaining({
          skip: 0,
          take: 10,
          group: [{ field: "SupplierID" }],
        }),
      );
    });

    it("emits the initial state once the microtask queue drains", fakeAsync(() => {
      const directive = createDirective();
      directive.take = 25;
      const ready = jasmine.createSpy("stateReady");
      const takeChange = jasmine.createSpy("takeChange");
      directive.stateReady.subscribe(ready);
      directive.takeChange.subscribe(takeChange);

      directive.ngOnInit();
      expect(ready).not.toHaveBeenCalled();

      tick();

      expect(takeChange).toHaveBeenCalledWith(25);
      expect(ready).toHaveBeenCalledWith(
        jasmine.objectContaining({ take: 25, skip: 0 }),
      );
    }));

    it("starts with no expanded rows", () => {
      const directive = createDirective();
      const expandedRowsChange = jasmine.createSpy("expandedRowsChange");
      directive.expandedRowsChange.subscribe(expandedRowsChange);

      directive.ngOnInit();

      expect(directive.expandedRows).toEqual([]);
      expect(expandedRowsChange).toHaveBeenCalledWith([]);
    });
  });

  describe("with persisted state", () => {
    beforeEach(() => {
      store.setItem(
        KEY,
        JSON.stringify({
          state: {
            skip: 20,
            take: 5,
            sort: [{ field: "ProductName", dir: "asc" }],
            group: [{ field: "SupplierID" }],
            filter: { logic: "and", filters: [] },
          },
          expandedRows: [true, false, true],
          columns: [],
        } as IGridState),
      );
    });

    it("restores the persisted state over the directive's inputs", fakeAsync(() => {
      const directive = createDirective();
      directive.skip = 0;
      directive.take = 10;
      const ready = jasmine.createSpy("stateReady");
      directive.stateReady.subscribe(ready);

      directive.ngOnInit();
      tick();

      expect(ready).toHaveBeenCalledWith(
        jasmine.objectContaining({
          skip: 20,
          take: 5,
          sort: [{ field: "ProductName", dir: "asc" }],
        }),
      );
    }));

    it("emits each restored value on its own output", fakeAsync(() => {
      const directive = createDirective();
      const skipChange = jasmine.createSpy("skipChange");
      const sortChange = jasmine.createSpy("sortChange");
      const groupChange = jasmine.createSpy("groupChange");
      const filterChange = jasmine.createSpy("filterChange");
      directive.skipChange.subscribe(skipChange);
      directive.sortChange.subscribe(sortChange);
      directive.groupChange.subscribe(groupChange);
      directive.filterChange.subscribe(filterChange);

      directive.ngOnInit();
      tick();

      expect(skipChange).toHaveBeenCalledWith(20);
      expect(sortChange).toHaveBeenCalledWith([
        { field: "ProductName", dir: "asc" },
      ]);
      expect(groupChange).toHaveBeenCalledWith([{ field: "SupplierID" }]);
      expect(filterChange).toHaveBeenCalledWith({ logic: "and", filters: [] });
    }));

    it("restores expanded rows", () => {
      const directive = createDirective();
      const expandedRowsChange = jasmine.createSpy("expandedRowsChange");
      directive.expandedRowsChange.subscribe(expandedRowsChange);

      directive.ngOnInit();

      expect(directive.expandedRows).toEqual([true, false, true]);
      expect(expandedRowsChange).toHaveBeenCalledWith([true, false, true]);
    });

    it("reports expanded rows back to the grid", () => {
      const directive = createDirective();
      directive.ngOnInit();

      expect(grid.isDetailExpanded({ index: 0 } as RowArgs)).toBe(true);
      expect(grid.isDetailExpanded({ index: 1 } as RowArgs)).toBe(false);
    });
  });

  describe("grid events", () => {
    let directive: GridStateDirective;

    beforeEach(() => {
      directive = createDirective();
      directive.ngOnInit();
    });

    it("persists state on dataStateChange", () => {
      grid.dataStateChange.emit({
        skip: 30,
        take: 15,
        sort: [{ field: "UnitPrice", dir: "desc" }],
      } as DataStateChangeEvent);

      expect(stored().state).toEqual(
        jasmine.objectContaining({ skip: 30, take: 15 }),
      );
    });

    it("marks a row expanded on detailExpand", () => {
      const expandedRowsChange = jasmine.createSpy("expandedRowsChange");
      directive.expandedRowsChange.subscribe(expandedRowsChange);

      grid.detailExpand.emit({ index: 2 } as DetailExpandEvent);

      expect(directive.expandedRows[2]).toBe(true);
      expect(stored().expandedRows?.[2]).toBe(true);
      expect(expandedRowsChange).toHaveBeenCalled();
    });

    it("marks a row collapsed on detailCollapse", () => {
      grid.detailExpand.emit({ index: 2 } as DetailExpandEvent);

      grid.detailCollapse.emit({ index: 2 } as DetailCollapseEvent);

      expect(directive.expandedRows[2]).toBe(false);
      expect(stored().expandedRows?.[2]).toBe(false);
    });

    it("stops persisting once destroyed", () => {
      directive.ngOnDestroy();

      grid.dataStateChange.emit({ skip: 999 } as DataStateChangeEvent);

      expect(stored().state.skip).not.toBe(999);
    });
  });

  describe("columns", () => {
    it("persists column layout on destroy", () => {
      grid.setColumns([
        column({ field: "ProductName", hidden: true, width: 250 }),
        column({ field: "SupplierID", orderIndex: 1, leafIndex: 1 }),
      ]);
      const directive = createDirective();
      directive.ngOnInit();

      directive.ngOnDestroy();

      const columns = stored().columns;
      expect(columns.length).toBe(2);
      expect(columns[0]).toEqual(
        jasmine.objectContaining({
          origIdx: 0,
          field: "ProductName",
          hidden: true,
          width: 250,
        }),
      );
      expect(columns[1]).toEqual(
        jasmine.objectContaining({ origIdx: 1, orderIndex: 1, leafIndex: 1 }),
      );
    });

    it("persists column layout on beforeunload", () => {
      grid.setColumns([column({ hidden: true })]);
      const directive = createDirective();
      directive.ngOnInit();

      directive.unload(new Event("beforeunload") as BeforeUnloadEvent);

      expect(stored().columns[0].hidden).toBe(true);
    });

    it("applies persisted column layout to the grid", () => {
      store.setItem(
        KEY,
        JSON.stringify({
          state: {},
          columns: [
            {
              origIdx: 0,
              hidden: true,
              orderIndex: 2,
              leafIndex: 2,
              width: 40,
            },
            {
              origIdx: 1,
              hidden: false,
              orderIndex: 0,
              leafIndex: 0,
              width: 300,
            },
          ],
        } as IGridState),
      );
      grid.setColumns([column(), column()]);
      const directive = createDirective();
      directive.ngOnInit();

      directive.ngAfterContentInit();

      const [first, second] = grid.columns.toArray();
      expect(first.hidden).toBe(true);
      expect(first.orderIndex).toBe(2);
      expect(first.leafIndex).toBe(2);
      expect(first.width).toBe(40);
      expect(second.width).toBe(300);
      expect(second.orderIndex).toBe(0);
    });

    it("leaves the grid alone when no column layout is persisted", () => {
      grid.setColumns([column({ width: 100 })]);
      const directive = createDirective();
      directive.ngOnInit();

      directive.ngAfterContentInit();

      expect(grid.columns.toArray()[0].width).toBe(100);
    });
  });

  describe("expandedRows input", () => {
    let directive: GridStateDirective;

    beforeEach(() => {
      directive = createDirective();
      directive.ngOnInit();
    });

    it("keeps persisted rows the incoming value does not reach", () => {
      grid.detailExpand.emit({ index: 0 } as DetailExpandEvent);
      grid.detailExpand.emit({ index: 2 } as DetailExpandEvent);

      directive.expandedRows = [false];

      expect(directive.expandedRows[0]).toBe(false);
      expect(directive.expandedRows[2]).toBe(true);
      expect(stored().expandedRows?.[2]).toBe(true);
    });

    it("overwrites persisted rows the incoming value does reach", () => {
      grid.detailExpand.emit({ index: 0 } as DetailExpandEvent);

      // forEach visits explicit undefined, so this clears index 0 rather than
      // leaving the persisted value in place. Only indices past the end of the
      // incoming array (or holes in a sparse one) are preserved.
      directive.expandedRows = [undefined] as unknown as boolean[];

      expect(directive.expandedRows[0]).toBeUndefined();
    });
  });
});

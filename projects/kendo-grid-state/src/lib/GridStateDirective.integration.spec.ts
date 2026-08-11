import { Component, ViewChild } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import {
  DataStateChangeEvent,
  GridComponent,
  GridModule,
} from "@progress/kendo-angular-grid";
import { APP_STORAGE } from "./AppStorage";
import { IGridState } from "./GridState";
import { GridStateDirective } from "./GridStateDirective";

const KEY = "IntegrationGrid";

@Component({
  imports: [GridModule, GridStateDirective],
  template: `
    <kendo-grid
      [data]="data"
      [gridState]="'IntegrationGrid'"
      [pageable]="true"
      [sortable]="true"
      [resizable]="true"
      [reorderable]="true"
      [skip]="skip"
      [pageSize]="take"
      [sort]="sort"
      (stateReady)="onStateReady($event)"
    >
      <kendo-grid-column field="name" title="Name"></kendo-grid-column>
      <kendo-grid-column field="price" title="Price"></kendo-grid-column>
    </kendo-grid>
  `,
})
class HostComponent {
  @ViewChild(GridComponent) grid!: GridComponent;
  data = [
    { name: "Chai", price: 18 },
    { name: "Chang", price: 19 },
    { name: "Aniseed Syrup", price: 10 },
  ];
  skip = 0;
  take = 10;
  sort: DataStateChangeEvent["sort"] = [];
  ready: DataStateChangeEvent | undefined;

  onStateReady(e: DataStateChangeEvent): void {
    this.ready = e;
    this.skip = e.skip as number;
    this.take = e.take as number;
    this.sort = e.sort;
  }
}

/**
 * These run the directive against a real kendo-grid rather than a stub, so a
 * breaking change in the Kendo APIs the directive depends on (the columns
 * QueryList, isDetailExpanded, the column layout properties) fails here.
 */
describe("GridStateDirective against a real grid", () => {
  let store: Storage;
  let fixture: ComponentFixture<HostComponent>;

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

  function stored(): IGridState {
    return JSON.parse(store.getItem(KEY) as string);
  }

  beforeEach(async () => {
    store = fakeStorage();
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideNoopAnimations(),
        { provide: APP_STORAGE, useValue: store },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it("renders and persists an initial state", fakeAsync(() => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture.componentInstance.grid).toBeTruthy();
    expect(stored().state).toEqual(
      jasmine.objectContaining({ skip: 0, take: 10 }),
    );
  }));

  it("restores a persisted state into the grid", fakeAsync(() => {
    store.setItem(
      KEY,
      JSON.stringify({
        state: { skip: 2, take: 5, sort: [{ field: "price", dir: "desc" }] },
        columns: [],
      } as IGridState),
    );

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const host = fixture.componentInstance;
    expect(host.ready).toEqual(
      jasmine.objectContaining({
        skip: 2,
        take: 5,
        sort: [{ field: "price", dir: "desc" }],
      }),
    );
    expect(host.grid.skip).toBe(2);
    expect(host.grid.pageSize).toBe(5);
  }));

  it("persists the grid's real column layout on destroy", fakeAsync(() => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const columns = fixture.componentInstance.grid.columns.toArray();
    columns[0].width = 320;
    columns[1].hidden = true;

    fixture.destroy();

    const persisted = stored().columns;
    expect(persisted.length).toBe(2);
    expect(persisted[0]).toEqual(
      jasmine.objectContaining({ origIdx: 0, field: "name", width: 320 }),
    );
    expect(persisted[1]).toEqual(
      jasmine.objectContaining({ origIdx: 1, field: "price", hidden: true }),
    );
  }));

  it("applies a persisted column layout to the grid's columns", fakeAsync(() => {
    store.setItem(
      KEY,
      JSON.stringify({
        state: { skip: 0, take: 10 },
        columns: [
          {
            origIdx: 0,
            hidden: false,
            orderIndex: 1,
            leafIndex: 1,
            width: 400,
          },
          { origIdx: 1, hidden: true, orderIndex: 0, leafIndex: 0, width: 60 },
        ],
      } as IGridState),
    );

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const columns = fixture.componentInstance.grid.columns.toArray();
    expect(columns[0].width).toBe(400);
    expect(columns[0].orderIndex).toBe(1);
    expect(columns[1].width).toBe(60);
    expect(columns[1].hidden).toBe(true);
  }));

  it("round-trips a layout change across a teardown and rebuild", fakeAsync(() => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    fixture.componentInstance.grid.columns.toArray()[0].width = 275;
    fixture.destroy();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture.componentInstance.grid.columns.toArray()[0].width).toBe(275);
  }));
});

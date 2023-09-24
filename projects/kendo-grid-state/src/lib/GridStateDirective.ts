import {
  Directive,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterContentInit,
  HostListener,
} from "@angular/core";
import {
  GridComponent,
  RowArgs,
  DetailExpandEvent,
  DetailCollapseEvent,
  DataStateChangeEvent,
  ColumnBase,
} from "@progress/kendo-angular-grid";
import {
  CompositeFilterDescriptor,
  SortDescriptor,
  GroupDescriptor,
} from "@progress/kendo-data-query";
import { Subscription } from "rxjs";
import { Column } from "./Column";
import { IGridState } from "./GridState";
//import { IGridStateStorage } from "./GridStateStorage";
import { StorageService } from "./StorageService";
@Directive({
  selector: "kendo-grid[gridState]",
})
export class GridStateDirective implements OnInit, OnDestroy, AfterContentInit {
  /**tracks subscriptions*/
  private subs: Subscription = new Subscription();
  /**tracks the expanded rows*/
  private _expandedRows: any[] = [];
  // Input provides external setting of expanded rows
  @Input() get expandedRows(): any[] {
    //this._expandedRows = (this.state && this.state.expandedRows) || [];
    return this._expandedRows;
  }
  set expandedRows(val: any[]) {
    const _combine = [];
    //check if there are any persisted
    const existing = (this.state && this.state.expandedRows) || [];
    //combine initial with stored state
    existing.forEach((el, idx) => {
      _combine[idx] = el;
    });
    val.forEach((el, idx) => {
      _combine[idx] = el;
    });
    this.state = Object.assign(this.state || {}, {
      expandedRows: _combine,
    } as IGridState);
    this._expandedRows = _combine;
  }
  @Output() expandedRowsChange: EventEmitter<any[]> = new EventEmitter();
  /**Emitter for when persisted state is ready*/
  @Output() stateReady: EventEmitter<DataStateChangeEvent> = new EventEmitter();
  @Input() filter: CompositeFilterDescriptor;
  /**Emitter for when filter state is hydrated */
  @Output()
  filterChange: EventEmitter<CompositeFilterDescriptor> = new EventEmitter();
  /**gridState key: required*/
  @Input() gridState: string; //key
  @Input() sort: Array<SortDescriptor>;
  /**Emitter for when sort state is hydrated */
  @Output() sortChange: EventEmitter<Array<SortDescriptor>> =
    new EventEmitter();
  @Input() skip?: number = 0;
  /**Emitter for when skip state is hydrated */
  @Output() skipChange: EventEmitter<number> = new EventEmitter();
  @Input() group?: Array<GroupDescriptor>;
  /**Emitter for when group state is hydrated */
  @Output() groupChange: EventEmitter<Array<GroupDescriptor>> =
    new EventEmitter();
  @Input() take?: number = 10;
  /**Emitter for when take state is hydrated */
  @Output() takeChange: EventEmitter<number> = new EventEmitter();
  /**Session storage type: defaults to session */
  //@Input() storage: "session" | "local" | IGridStateStorage = "session";
  constructor(
    private grid: GridComponent,
    private storageService: StorageService,
  ) {
    //bind the isDetailsExpanded callback
    this.grid.isDetailExpanded = this.expander.bind(this);
  }

  private expander(args: RowArgs): boolean {
    return this._expandedRows[args.index];
  }
  private get key() {
    const key: string = this.gridState;
    return key;
  }
  // private get storageType(): IGridStateStorage {
  //   switch (this.storage) {
  //     case "local":
  //       return localStorage;
  //     case "session":
  //       return sessionStorage;
  //     default:
  //       return this.storage;
  //   }
  // }
  /**Gets the IGridState object from storage */
  public get state(): IGridState {
    const raw: string = this.storageService.getItem(this.key);
    const parsed = raw ? JSON.parse(raw) : raw;
    return parsed;
  }
  /**Sets the IGridState object to storage */
  public set state(val: IGridState) {
    this.storageService.setItem(this.key, JSON.stringify(val));
  }
  public get initState(): DataStateChangeEvent {
    return {
      group: this.group,
      skip: this.skip,
      sort: this.sort,
      filter: this.filter,
      take: this.take,
    };
  }
  ngOnInit(): void {
    if (this.gridState == undefined || this.gridState == "") {
      throw "gridState has not been set, this is required to be unique for each grid as it is used as the storage key";
    }
    // if (
    //   this.storage !== "session" &&
    //   this.storage !== "local" &&
    //   (this.storage == null ||
    //     typeof this.storage.getItem != "function" ||
    //     typeof this.storage.setItem != "function")
    // ) {
    //   console.warn("gridState storage cannot be found, defaulting to session.");
    // }

    // set expandedRows array to stored state or empty array
    this._expandedRows = (this.state && this.state.expandedRows) || [];
    this.expandedRowsChange.emit(this._expandedRows);
    const merged: DataStateChangeEvent = Object.assign(
      this.initState,
      this.state && this.state.state,
    );
    this.state = Object.assign(this.state || {}, {
      state: merged,
    } as IGridState);
    setTimeout(() => {
      this.skipChange.emit(merged.skip);
      this.sortChange.emit(merged.sort);
      this.takeChange.emit(merged.take);
      this.groupChange.emit(merged.group);
      this.filterChange.emit(merged.filter);
      this.stateReady.emit(merged);
    });
    // handle the dataStateChange event
    this.subs.add(
      this.grid.dataStateChange.subscribe((s) => {
        this.state = Object.assign(this.state, { state: s } as IGridState);
      }),
    );

    // handle the detailExpand Event
    this.subs.add(
      this.grid.detailExpand.subscribe((e: DetailExpandEvent) => {
        this.expandedRows[e.index] = true;
        this.expandedRows = this._expandedRows;
        this.expandedRowsChange.emit(this._expandedRows);
      }),
    );
    // handle the detailCollapse Event
    this.subs.add(
      this.grid.detailCollapse.subscribe((e: DetailCollapseEvent) => {
        this._expandedRows[e.index] = false;
        this.expandedRows = this._expandedRows;
        this.expandedRowsChange.emit(this._expandedRows);
      }),
    );
  }

  private colMapper = (cols: ColumnBase[]): Column[] => {
    const c = cols.map(
      (m, idx) =>
        ({
          origIdx: idx,
          orderIndex: m.orderIndex,
          leafIndex: m.leafIndex,
          hidden: m.hidden,
          width: m.width,
          title: m.title,
          field: (m as any).field,
        }) as Column,
    );
    return c;
  };
  ngAfterContentInit(): void {
    const existing = this.state.columns;
    if (existing) {
      const cols = this.grid.columns.toArray();
      existing.forEach((e, i) => {
        cols[i].hidden = e.hidden;
        cols[i].orderIndex = e.orderIndex;
        cols[i].leafIndex = e.leafIndex;
        cols[i].width = e.width;
      });
      this.grid.columns.reset(cols);
    }
  }
  @HostListener("window:beforeunload", ["$event"]) unload(e): void {
    //this is only useful if input storage == local
    this.saveState();
  }
  private saveState(): void {
    this.state = Object.assign(
      this.state || { state: this.initState, columns: [] },
      {
        columns: this.colMapper(this.grid.columns.toArray()),
      },
    );
  }
  ngOnDestroy(): void {
    this.saveState();
    this.subs.unsubscribe();
  }
}

import {
  Directive,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterContentInit,
  HostListener,
  inject,
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
import { StorageService } from "./StorageService";

@Directive({
  selector: "kendo-grid[gridState]",
  standalone: true,
})
export class GridStateDirective implements OnInit, OnDestroy, AfterContentInit {
  private grid = inject(GridComponent);
  private storageService = inject(StorageService);

  private subs: Subscription = new Subscription();
  private _expandedRows: any[] = [];

  @Input() get expandedRows(): any[] {
    return this._expandedRows;
  }
  set expandedRows(val: any[]) {
    const _combine = [];
    const existing = (this.state && this.state.expandedRows) || [];
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
  @Output() stateReady: EventEmitter<DataStateChangeEvent> = new EventEmitter();
  @Input() filter: CompositeFilterDescriptor;
  @Output()
  filterChange: EventEmitter<CompositeFilterDescriptor> = new EventEmitter();
  @Input() gridState: string;
  @Input() sort: Array<SortDescriptor>;
  @Output() sortChange: EventEmitter<Array<SortDescriptor>> =
    new EventEmitter();
  @Input() skip?: number = 0;
  @Output() skipChange: EventEmitter<number> = new EventEmitter();
  @Input() group?: Array<GroupDescriptor>;
  @Output() groupChange: EventEmitter<Array<GroupDescriptor>> =
    new EventEmitter();
  @Input() take?: number = 10;
  @Output() takeChange: EventEmitter<number> = new EventEmitter();

  constructor() {
    this.grid.isDetailExpanded = this.expander.bind(this);
  }

  private expander(args: RowArgs): boolean {
    return this._expandedRows[args.index];
  }

  private get key(): string {
    return this.gridState;
  }

  public get state(): IGridState {
    const raw: string = this.storageService.getItem(this.key);
    const parsed = raw ? JSON.parse(raw) : raw;
    return parsed;
  }

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
    this.subs.add(
      this.grid.dataStateChange.subscribe((s) => {
        this.state = Object.assign(this.state, { state: s } as IGridState);
      }),
    );
    this.subs.add(
      this.grid.detailExpand.subscribe((e: DetailExpandEvent) => {
        this.expandedRows[e.index] = true;
        this.expandedRows = this._expandedRows;
        this.expandedRowsChange.emit(this._expandedRows);
      }),
    );
    this.subs.add(
      this.grid.detailCollapse.subscribe((e: DetailCollapseEvent) => {
        this._expandedRows[e.index] = false;
        this.expandedRows = this._expandedRows;
        this.expandedRowsChange.emit(this._expandedRows);
      }),
    );
  }

  private colMapper = (cols: ColumnBase[]): Column[] =>
    cols.map(
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

  @HostListener("window:beforeunload", ["$event"])
  unload(e: BeforeUnloadEvent): void {
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

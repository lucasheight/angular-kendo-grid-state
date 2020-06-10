import {
  Directive,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  QueryList,
  AfterContentInit,
} from "@angular/core";
import {
  GridComponent,
  ColumnComponent,
  RowArgs,
  DetailExpandEvent,
  DetailCollapseEvent,
  DataStateChangeEvent,
} from "@progress/kendo-angular-grid";
import {
  CompositeFilterDescriptor,
  SortDescriptor,
  GroupDescriptor,
} from "@progress/kendo-data-query";
import { Subscription } from "rxjs";
import { Column } from "./ColumnSettings";
import { IGridState } from "./GridSettings";
@Directive({
  selector: "[gridState]",
})
export class GridStateDirective implements OnInit, OnDestroy, AfterContentInit {
  /**tracks subscriptions*/
  private subs: Subscription = new Subscription();
  /**tracks the expanded rows*/
  private _expandedRows: boolean[] = [];
  // Input provides external setting of expanded rows
  @Input() get expandedRows(): boolean[] {
    //this._expandedRows = (this.state && this.state.expandedRows) || [];
    return this._expandedRows;
  }
  set expandedRows(val: boolean[]) {
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
  /**Emitter for when persisted state is ready*/
  @Output() stateReady: EventEmitter<DataStateChangeEvent> = new EventEmitter();
  @Input() filter: CompositeFilterDescriptor;
  /**Emitter for when filter state is hydrated */
  @Output() filterChange: EventEmitter<
    CompositeFilterDescriptor
  > = new EventEmitter();
  /**gridState key: required*/
  @Input() gridState: string; //key
  @Input() sort: Array<SortDescriptor>;
  /**Emitter for when sort state is hydrated */
  @Output() sortChange: EventEmitter<
    Array<SortDescriptor>
  > = new EventEmitter();
  @Input() skip?: number = 0;
  /**Emitter for when skip state is hydrated */
  @Output() skipChange: EventEmitter<number> = new EventEmitter();
  @Input() group?: Array<GroupDescriptor>;
  /**Emitter for when group state is hydrated */
  @Output() groupChange: EventEmitter<
    Array<GroupDescriptor>
  > = new EventEmitter();
  @Input() take?: number = 10;
  /**Emitter for when take state is hydrated */
  @Output() takeChange: EventEmitter<number> = new EventEmitter();
  /**Session storage type: defaults to session */
  @Input() storage: "session" | "local" = "session";
  constructor(private grid: GridComponent) {
    //bind the isDetailsExpanded callback
    this.grid.isDetailExpanded = this.expander.bind(this);
  }

  private expander(args: RowArgs): boolean {
    return this._expandedRows[args.index];
  }
  private get key() {
    const key: string = this.gridState.toString();
    return key;
  }
  private get storageType(): Storage {
    return this.storage === "local" ? localStorage : sessionStorage;
  }
  /**Gets the IGridState object from storage */
  public get state(): IGridState {
    const raw: string = this.storageType.getItem(this.key);
    const parsed = raw ? JSON.parse(raw) : raw;
    return parsed;
  }
  /**Sets the IGridState object to storage */
  public set state(val: IGridState) {
    this.storageType.setItem(this.key, JSON.stringify(val));
  }

  ngOnInit(): void {
    if (this.gridState == undefined || this.gridState == "") {
      throw "gridState has not been set, this is required to be unique for each grid as it is used as the storage key";
    }
    if (this.storage !== "session" && this.storage !== "local") {
      console.warn("gridState storage cannot be found, defaulting to session.");
    }

    // set expandedRows array to stored state or empty array
    this._expandedRows = (this.state && this.state.expandedRows) || [];
    const initState: DataStateChangeEvent = {
      group: this.group,
      skip: this.skip,
      sort: this.sort,
      filter: this.filter,
      take: this.take,
    };
    const merged: DataStateChangeEvent = Object.assign(
      initState,
      this.state && this.state.state
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
    // handle the columnVisibilityChange Event
    this.grid.columnVisibilityChange.subscribe((s) => {
      const existing = this.state;
      s.columns.forEach((col) => {
        existing.columns.find(
          (f) => f.field == (col as ColumnComponent).field
        ).hidden = col.hidden;
      });
      this.state = existing;
    });
    // handle the dataStateChange event
    this.subs.add(
      this.grid.dataStateChange.subscribe((s) => {
        this.state = Object.assign(this.state, { state: s } as IGridState);
      })
    );
    // handle the columnResize event
    this.subs.add(
      this.grid.columnResize.subscribe((s) => {
        const existing = this.state;
        //find the column
        s.forEach((e) => {
          const found = existing.columns.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (f) => f.field === (e.column as any).field
          );
          if (found) {
            found.width = e.newWidth;
          }
        });
        this.state = Object.assign(this.state, {
          columns: existing.columns,
        } as IGridState);
      })
    );
    // handle the columnReorder event
    this.subs.add(
      this.grid.columnReorder.subscribe((s) => {
        /*the reorder event does not include hidden columns
       so we need to cater for this

       1. Find the hidden columns
      */
        const hiddenCols = this.state.columns.reduce((acc, curr, idx) => {
          if (curr.hidden) {
            acc[idx] = curr;
          }
          return acc;
        }, []);
        const visibleCols: Column[] = this.state.columns.filter(
          (f) => f.hidden === undefined || f.hidden === false
        );

        //2. apply the reordering
        const reorderedCol = visibleCols.splice(s.oldIndex, 1);
        visibleCols.splice(s.newIndex, 0, ...reorderedCol);
        //3. Put hidden columns back in with their position, of course it will be slightly out of wack, but hey they were hidden
        hiddenCols.forEach((e, idx) => {
          visibleCols.splice(idx, 0, e);
        });
        this.state = Object.assign(this.state, {
          columns: visibleCols,
        } as IGridState);
      })
    );
    // handle the detailExpand Event
    this.subs.add(
      this.grid.detailExpand.subscribe((e: DetailExpandEvent) => {
        this.expandedRows[e.index] = true;
        this.expandedRows = this._expandedRows;
        // this.state = Object.assign(this.state, {
        //   expandedRows: this._expandedRows,
        // } as IGridState);
      })
    );
    // handle the detailCollapse Event
    this.subs.add(
      this.grid.detailCollapse.subscribe((e: DetailCollapseEvent) => {
        this._expandedRows[e.index] = false;
        this.expandedRows = this._expandedRows;
        // this.state = Object.assign(this.state, {
        //   expandedRows: this._expandedRows,
        // } as IGridState);
      })
    );
  }
  private colMapper = (cols: QueryList<ColumnComponent>): Column[] => {
    return cols.map(
      (m) => ({ field: m.field, hidden: m.hidden, width: m.width } as Column)
    );
  };
  ngAfterContentInit(): void {
    // apply the persisted column state to the grid column arrays
    const cols = this.grid.columns.toArray() as ColumnComponent[];
    //check to see if any have a blank field or non-existant field
    const any = cols.some((s) => {
      const found = s.field == "";
      return found || !Object.keys(s).find((f) => f == "field");
    });
    if (any) {
      console.warn(
        `One or more columns in the grid does not have the field attribute set.
        This could have unexpected results.
        `
      );
    }
    //get any existing stored col state
    const storedCols = this.state.columns;

    if (storedCols) {
      //set grid cols to match stored order and properties
      const sorted = storedCols.reduce((acc, curr) => {
        const found = cols.find((f) => f.field === curr.field);
        if (found) {
          found.width = curr.width;
          found.hidden = curr.hidden;
          acc.push(found);
        }
        return acc;
      }, [] as ColumnComponent[]);

      //reset cols to stored state
      this.grid.columns.reset(sorted);
    } else {
      const mapped = this.colMapper(
        this.grid.columns as QueryList<ColumnComponent>
      );
      // save col state back to store
      this.state = Object.assign(this.state, { columns: mapped } as IGridState);
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

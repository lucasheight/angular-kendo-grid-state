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
import { GridComponent, ColumnComponent } from "@progress/kendo-angular-grid";
import {
  CompositeFilterDescriptor,
  State,
  SortDescriptor,
  GroupDescriptor,
} from "@progress/kendo-data-query";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Column } from "./ColumnSettings";
import { IGridState } from "./GridSettings";

@Directive({
  selector: "[gridState]",
})
export class GridStateDirective implements OnInit, OnDestroy, AfterContentInit {
  _destroy$ = new Subject<void>();
  @Output() stateReady: EventEmitter<State> = new EventEmitter();
  @Input() filter: CompositeFilterDescriptor;
  @Output() filterChange: EventEmitter<
    CompositeFilterDescriptor
  > = new EventEmitter();

  @Input() gridState: string; //key
  @Input() sort: Array<SortDescriptor>;
  @Output() sortChange: EventEmitter<
    Array<SortDescriptor>
  > = new EventEmitter();
  @Input() skip?: number = 0;
  @Output() skipChange: EventEmitter<number> = new EventEmitter();
  @Input() group?: Array<GroupDescriptor>;
  @Output() groupChange: EventEmitter<
    Array<GroupDescriptor>
  > = new EventEmitter();
  @Input() take?: number = 10;
  @Output() takeChange: EventEmitter<number> = new EventEmitter();
  @Input() storage: Storage = sessionStorage;
  constructor(private grid: GridComponent) {
    //const
    //this.gridState(initState);
  }
  private get key() {
    const key: string = this.gridState.toString();
    return key;
  }
  public get state(): IGridState {
    const raw: string = this.storage.getItem(this.key);
    const parsed = raw ? JSON.parse(raw) : raw;
    return parsed;
  }
  public set state(val: IGridState) {
    this.storage.setItem(this.key, JSON.stringify(val));
  }
  ngOnInit(): void {
    if (this.gridState == undefined || this.gridState == "") {
      throw "gridState has not been set, this is required to be unique for each grid as it is used as the storage key";
    }

    const initState: State = {
      group: this.group,
      skip: this.skip,
      sort: this.sort,
      filter: this.filter,
      take: this.take,
    };
    const merged: State = Object.assign(
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
    this.grid.columnVisibilityChange
      .pipe(takeUntil(this._destroy$))
      .subscribe((s) => {
        const existing = this.state;
        s.columns.forEach((col) => {
          existing.columns.find(
            (f) => f.field == (col as ColumnComponent).field
          ).hidden = col.hidden;
        });
        this.state = existing;
      });
    // this.grid.columns.changes.pipe(takeUntil(this._destroy$)).subscribe((s) => {
    //   console.log("columns", s);
    // });
    this.grid.dataStateChange.pipe(takeUntil(this._destroy$)).subscribe((s) => {
      console.log("dataStateChange", s);
      this.state = Object.assign(this.state, { state: s } as IGridState);
    });
    this.grid.columnResize.pipe(takeUntil(this._destroy$)).subscribe((s) => {
      console.log("resize", s);

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
      this.state = Object.assign(this.state, { columns: existing.columns });
    });
    this.grid.columnReorder.pipe(takeUntil(this._destroy$)).subscribe((s) => {
      console.log("reorder", s);
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
      this.state = Object.assign(this.state, { columns: visibleCols });
    });
  }
  private colMapper = (cols: QueryList<ColumnComponent>): Column[] => {
    return cols.map(
      (m) => ({ field: m.field, hidden: m.hidden, width: m.width } as Column)
    );
  };
  ngAfterContentInit(): void {
    const cols = this.grid.columns.toArray() as ColumnComponent[];
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

      //todo set up column expanded
    } else {
      const mapped = this.colMapper(
        this.grid.columns as QueryList<ColumnComponent>
      );
      // save col state back to store
      this.state = Object.assign(this.state, { columns: mapped } as IGridState);

      console.log(
        "colsMap",
        this.colMapper(this.grid.columns as QueryList<ColumnComponent>)
      );
    }
  }
  ngOnDestroy(): void {
    this._destroy$.next();
  }
}

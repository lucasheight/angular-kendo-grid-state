import { Component, OnInit, inject, ChangeDetectorRef } from "@angular/core";
import { Observable } from "rxjs";
import {
  GridDataResult,
  DataStateChangeEvent,
  GridComponent,
  ColumnComponent,
  CellTemplateDirective,
  DetailTemplateDirective,
} from "@progress/kendo-angular-grid";
import { State, toODataString, groupBy } from "@progress/kendo-data-query";
import { map } from "rxjs/operators";
import { AppService } from "./app.service";
import { GridStateDirective } from "projects/kendo-grid-state/src/public-api";
import { AsyncPipe, JsonPipe } from "@angular/common";
@Component({
  selector: "gridDirectiveCompoment",
  templateUrl: "./grid.directive.component.html",
  imports: [
    GridComponent,
    GridStateDirective,
    ColumnComponent,
    CellTemplateDirective,
    DetailTemplateDirective,
    AsyncPipe,
    JsonPipe,
  ],
})
export class GridDirectiveComponent implements OnInit {
  private service = inject(AppService);
  private cdr = inject(ChangeDetectorRef);

  title: string = "example grid";
  loading: boolean = false;
  gridState: State = { skip: 0, take: 10, group: [{ field: "SupplierID" }] };
  expandedRows: any[] = [];
  data$: Observable<GridDataResult>;
  onGotState = (e: DataStateChangeEvent): void => {
    this.onStateChange(e);
  };

  ngOnInit(): void {
    this.data$ = this.service.state$.pipe(
      map((m) => {
        const res = groupBy(m.value, this.gridState.group);
        return {
          data: res,
          total: m["@odata.count"],
        } as GridDataResult;
      }),
    );
    // Fires outside a template event binding, so under the default OnPush
    // strategy the view has to be marked dirty explicitly.
    this.service.complete = () => {
      this.loading = false;
      this.cdr.markForCheck();
    };
  }
  public onStateChange = (e: DataStateChangeEvent): void => {
    this.loading = true;
    this.gridState = e;
    this.service.query(toODataString(e));
  };
}

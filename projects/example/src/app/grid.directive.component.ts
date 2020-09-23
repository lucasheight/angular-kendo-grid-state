import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import {
  GridDataResult,
  DataStateChangeEvent,
} from "@progress/kendo-angular-grid";
import { State, toODataString, groupBy } from "@progress/kendo-data-query";
import { map } from "rxjs/operators";
import { AppService } from "./app.service";

@Component({
  selector: "gridDirectiveCompoment",
  templateUrl: "./grid.directive.component.html",
})
export class GridDirectiveComponent implements OnInit {
  title: string = "example grid";
  loading: boolean = false;
  gridState: State = { skip: 0, take: 10, group: [{ field: "SupplierID" }] };
  expandedRows: any[] = [];
  data$: Observable<GridDataResult>;
  constructor(private service: AppService) {}
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
      })
    );
    this.service.complete = () => {
      this.loading = false;
    };
    // this.onStateChange(this.gridState as DataStateChangeEvent);
  }
  public onStateChange = (e: DataStateChangeEvent): void => {
    this.loading = true;
    this.gridState = e;
    this.service.query(toODataString(e));
  };
}

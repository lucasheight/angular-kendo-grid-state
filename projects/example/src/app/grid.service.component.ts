import { Component } from "@angular/core";
import {
  GridSettings,
  GridStateService,
  GRID_STATE,
} from "projects/kendo-grid-state/src/public-api";
import { Observable } from "rxjs";
import {
  GridDataResult,
  DataStateChangeEvent,
} from "@progress/kendo-angular-grid";
import { State, toODataString } from "@progress/kendo-data-query";
import { AppService } from "./app.service";
import { map } from "rxjs/operators";
import { appComponentGridSettings } from "./app.component.gridsettings";

@Component({
  selector: "gridServiceCompoment",
  templateUrl: "./grid.service.component.html",
  providers: [
    GridStateService,
    { provide: GRID_STATE, useValue: appComponentGridSettings },
  ],
})
export class GridServiceComponent {
  title: string = "example grid";
  loading: boolean = false;
  gridSettings: GridSettings;
  data$: Observable<GridDataResult>;
  constructor(
    private service: AppService,
    public gridStateService: GridStateService
  ) {
    this.gridSettings = gridStateService.get();
  }
  onGotState = (e: State): void => {
    console.log("gotState", e);
    this.onStateChange(e as DataStateChangeEvent);
    //this.onStateChange(this.gridSettings.state as DataStateChangeEvent);
  };

  ngOnInit(): void {
    this.data$ = this.service.state$.pipe(
      map(
        (m) => ({ data: m.value, total: m["@odata.count"] } as GridDataResult)
      )
    );
    this.service.complete = () => {
      this.loading = false;
    };
    this.onStateChange(this.gridSettings.state as DataStateChangeEvent);
  }
  public onStateChange = (e: DataStateChangeEvent): void => {
    this.loading = true;

    this.gridSettings.state = e;
    // this.gridStateService.set(this.gridSettings);
    this.service.query(toODataString(this.gridSettings.state));
  };
}

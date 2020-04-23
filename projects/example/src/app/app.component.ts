import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { GridStateService, GridSettings, GRID_STATE } from 'kendo-grid-state';
import { appComponentGridSettings } from './app.component.gridsettings';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toODataString } from '@progress/kendo-data-query';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [GridStateService, { provide: GRID_STATE, useValue: appComponentGridSettings }]
})
export class AppComponent implements OnInit {
  title: string = 'example grid';
  loading: boolean = false;
  gridSettings: GridSettings;
  data$: Observable<GridDataResult>;
  constructor(private service: AppService, public gridStateService: GridStateService) {
    this.gridSettings = gridStateService.get();
  }

  ngOnInit(): void {
    this.data$ = this.service.state$.pipe(map(m => ({ data: m.value, total: m["@odata.count"] } as GridDataResult)));
    this.service.complete = () => {
      this.loading = false;
    }
    this.onStateChange(this.gridSettings.state as DataStateChangeEvent);
  }
  public onStateChange = (e: DataStateChangeEvent): void => {
    this.loading = true;

    this.gridSettings.state = e;
    this.gridStateService.set(this.gridSettings);
    this.service.query(toODataString(this.gridSettings.state))

  };
}

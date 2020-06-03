# GridStateDirective

**_Following on from the adventures of implementing grid state for Telerik's Angular Kendo Grid in a [reusable way](./README.md)._**

The implementation of a service based solution works fine, but there was so much boiler plating needed to be done to implement persistence of a grid.
When you have a project that has many grids, this gets old quick.

So I have decided to use different approach using a Directive that hooks into the grid events that would be required to implement state. Also this approach manages the columns array internally without the need to predefine the array as previous was the case. So yes this means just template out the columns as one normally would do.

## Features
* State persistence is managed entirely in the directive.
* State storage can be session or local defaults to session.
* Persists expanded rows.
* Persists column visibility.
* Persists column resize.
* Persists column reorder.


Overall now to enable grid state, import the module `GridStateModule`, add the directive to the grid, provide a key (`gridState="ANiceGrid"`). _Optionally set the storage attribute `[storage]="'session' || 'local'"]` defaults to session_:
``` typescript
  @NgModule({
    declarations: [AppComponent, GridServiceComponent, GridDirectiveComponent],
    imports: [
      BrowserModule,
      BrowserAnimationsModule,
      CommonModule,
      HttpClientModule,
      GridModule,
      GridStateModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
  })
  export class AppModule {}
```

``` html
<kendo-grid gridState="ANiceGrid" (stateReady)="onGotState($event)"
  [data]="data$ | async"
  [pageable]="{
    buttonCount: 5,
    info: true,
    type: 'numeric',
    pageSizes: true,
    previousNex: true
  }"
  [loading]="loading"
  [pageSize]="gridState.take"
  [filter]="gridState.filter"
  [groupable]="false"
  [group]="gridState.group"
  [sortable]="true"
  [skip]="gridState.skip"
  [sort]="gridState.sort"
  [filterable]="true"
  [resizable]="true"
  [reorderable]="true"
  [columnMenu]="true"
  (dataStateChange)="onStateChange($event)">
  <kendo-grid-column field="ProductName"></kendo-grid-column>
  <kendo-grid-column field="SupplierID" filter="numeric"></kendo-grid-column>
  <kendo-grid-column field="QuantityPerUnit"></kendo-grid-column>
</kendo-grid>
```
In the component handle the `stateReady` event.

``` typescript
  loading: boolean = false;
  gridState: State = { skip: 0, take: 5 };
  data$: Observable<GridDataResult>;
  onGotState = (e: State): void => {
    this.onStateChange(e as DataStateChangeEvent);
  };
  public onStateChange = (e: DataStateChangeEvent): void => {
    this.loading = true;
    this.gridState = e;
    this.service.query(toODataString(e));
  };
```
A demo can be found on [stackblitz here.](https://stackblitz.com/edit/angular-kendo-grid-state-directive)

[![npm version](https://badge.fury.io/js/%40lucasheight%2Fkendo-grid-state.svg)](https://badge.fury.io/js/%40lucasheight%2Fkendo-grid-state)

# Angular kendo-grid-State directive

## Purpose

A helper library that implements a directive to manage grid state during session or between sessions for [@Progress Kendo UI for Angular Grid.](https://www.telerik.com/kendo-angular-ui)

## Features

- State persistence is managed entirely in the directive.
- State storage can be session or local defaults to session.
- Persists expanded rows.
- Persists column visibility.
- Persists column resize.
- Persists column reorder.
- Persists grid sort, page, page size, group, filter etc..

## How to use

### Install

Install the Angular library with NPM:

```
    npm install --save @lucasheight/kendo-grid-state
```

### Using the library

To enable grid state, import the module `GridStateModule`, add the directive to the grid, provide a unique key for this grid e.g. `gridState="ANiceGrid"`.
By default the state is stored in browser sessionStorage, this can be overiden by changing the APP_STORAGE provider (See below) :

```typescript
@NgModule({
  declarations: [AppComponent, GridServiceComponent, GridDirectiveComponent],
  imports: [BrowserModule, BrowserAnimationsModule, CommonModule, HttpClientModule, GridModule, GridStateModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

```html
<kendo-grid
  gridState="ANiceGrid"
  (stateReady)="onGotState($event)"
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
  (dataStateChange)="onStateChange($event)"
>
  <kendo-grid-column field="ProductName"></kendo-grid-column>
  <kendo-grid-column field="SupplierID" filter="numeric"></kendo-grid-column>
  <kendo-grid-column field="QuantityPerUnit"></kendo-grid-column>
</kendo-grid>
```

In the component handle the `stateReady` event.

```typescript
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

## Changing Gridstate storage provider

To change the application storage for all grids in your application, add the APP_STORAGE provier in the app module:

For example, this module sets the provider to use localStorage instead of the default sessionStorage.

```typescript
@NgModule({
  declarations: [AppComponent, GridDirectiveComponent],
  imports: [BrowserModule, BrowserAnimationsModule, CommonModule, HttpClientModule, GridModule, GridStateModule],
  providers: [{ provide: APP_STORAGE, useFactory: () => localStorage }],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Custom storage providers

To implement your own custom storage provider, implement the Storage interface. Then add your factory to the provider. E.g:

```typescript
export const CustomStorage: Storage = {
  length: undefined,
  clear(): void {
    throw new Error("Method not implemented.");
  },
  getItem(key: string): string {
    return "hello custom storage";
  },
  key(index: number): string {
    return "hello from custom storage";
  },
  removeItem(key: string): void {
    console.log("remove custom storage", key);
  },
  setItem(key: string, value: string): void {
    console.log("set custom storage", key);
  }
};
@NgModule({
  declarations: [AppComponent, GridDirectiveComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    GridModule,
    GridStateModule,
  ],
  providers: [{ provide: APP_STORAGE, useFactory: () => CustomStorage }],
  bootstrap: [AppComponent],
})
```

A demo can be found on [stackblitz here.](https://stackblitz.com/edit/angular-kendo-grid-state-directive)

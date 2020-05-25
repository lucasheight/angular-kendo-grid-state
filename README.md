[![npm version](https://badge.fury.io/js/%40lucasheight%2Fkendo-grid-state.svg)](https://badge.fury.io/js/%40lucasheight%2Fkendo-grid-state)
# Angular kendo-grid-State

## Purpose

A helper library that implements a service to manage grid state during session or between sessions for [@Progress Kendo UI for Angular Grid.](https://www.telerik.com/kendo-angular-ui)

## How to use

### Install

Install the Angular library with NPM:

```
    npm install --save @lucasheight/kendo-grid-state
```

### Using the library

#### Configure the grid and column settings

An example project is included in source [here](./projects/example)

- Create an object that implements GridSettings.
- Assign unique key for the state.
- Assign the Storage type. E.g. `sessionStorage or localStorage`
- Assign the initial grid state.
- Assign the columns collection configuration.

```typescript
export const appComponentGridSettings: GridSettings = {
  key: "exampleAppGridSettings",
  storage: sessionStorage,
  state: {
    skip: 0,
    take: 20,
    sort: [{ field: "ProductName", dir: "asc" }],
    filter: { logic: "and", filters: [] },
  },
  columns: [
    {
      title: "Id",
      field: "ProductID",
      editable: false,
      hidden: true,
      filterable: false,
    },
    //Or use a class object to construct a column
    new ColumnSettings({
      field: "ProductName",
      title: "Product Name",
      editable: true,
      filterable: true,
    }),
    //additional columns
  ],
};
```

#### Configure the component that hosts the grid

- Add GridStateService to the providers.
- Add the GRID_STATE constant to the providers and use the value of the GridSettings object created previously.

```typescript
 @Component({
 providers: [
    GridStateService,
    { provide: GRID_STATE, useValue: appComponentGridSettings },
  ]
 })....

```

- In the class constructor call the get() method on the GridStateService to populate the default settings. _Note the public assessor on the gridStateService. This service requires to be public to be accessible in the html template if using the columnVisibilityChange event._

```typescript
export class GridComponent {
  gridSettings: GridSettings;
  constructor(
    private service: AppService,
    public gridStateService: GridStateService
  ) {
    this.gridSettings = gridStateService.get();
  }
}
```

- Every time an event is raised in your component that changes the grid state, call the set() method on the GridStateService.
  Example:

```typescript
  public onStateChange = (e: DataStateChangeEvent): void => {
    this.loading = true;
    this.gridSettings.state = e;
    this.gridStateService.set(this.gridSettings);
    this.service.query(toODataString(this.gridSettings.state));
  };
```

#### Configure the html template

Add a `<kendo-grid></kendo-grid>` to the template. Use an `*ngFor` to iterate over the configured columns array.
If your grid makes use of column templates, use an `*ngIf` on the template to filter for the required field. Example below.

Configure the grid attributes for the managed states. Config the columnVisibilityChange event if required. The handler for this event is available on the GridStateService. `(columnVisibilityChange)="gridStateService.onVisibilityChange($event)"`

**Full template example**

```html
<h1>Northwind Products</h1>

<kendo-grid
  #grid
  [data]="data$ |async"
  [pageSize]="gridSettings.state.take"
  [pageable]="{
  buttonCount:5,
  info:true,
  type:'numeric',
  pageSizes:true,
  previousNex:true
  }"
  [loading]="loading"
  [filter]="gridSettings.state.filter"
  [groupable]="false"
  [group]="gridSettings.state.group"
  [sortable]="true"
  [skip]="gridSettings.state.skip"
  [sort]="gridSettings.state.sort"
  [filterable]="true"
  [columnMenu]="true"
  (dataStateChange)="onStateChange($event)"
  (columnVisibilityChange)="gridStateService.onVisibilityChange($event)"
>
  <kendo-grid-column
    *ngFor="let col of gridSettings.columns"
    [title]="col.title"
    [field]="col.field"
    [hidden]="col.hidden===undefined?false:col.hidden"
    [filterable]="col.filterable"
    [editable]="col.editable===undefined?true:col.editable"
  >
    <ng-template
      *ngIf="col.field==='ProductId'"
      kendoGridCellTemplate
      let-dataItem
    >
    {{dataItem.ProductId}} - {{dataItem.ProductName}}
    </ng-template>
  </kendo-grid-column>
</kendo-grid>
```

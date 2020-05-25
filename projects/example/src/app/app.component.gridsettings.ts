import {
  GridSettings,
  ColumnSettings,
} from "../../../kendo-grid-state/src/public-api";

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
    new ColumnSettings({
      field: "ProductName",
      title: "Product Name",
      editable: true,
      filterable: true,
    }),
    {
      field: "SupplierID",
      title: "Supplier",
      editable: false,
      filterable: false,
    },
    {
      field: "QuantityPerUnit",
      title: "Quantity per unit",
      editable: false,
      filterable: true,
    },
    {
      field: "UnitPrice",
      title: "Unit Price",
      editable: true,
      editor: "numeric",
      filterable: true,
    },
    {
      field: "UnitsInStock",
      title: "Units in stock",
      editable: false,
      filterable: true,
    },
    {
      field: "UnitsOnOrder",
      title: "Units on order",
      editable: false,
      filterable: true,
      hidden: true,
    },
    {
      field: "ReorderLevel",
      title: "Reorder Level",
      editable: false,
      filterable: true,
      hidden: true,
    },
    {
      field: "Discontinued",
      title: "Discontinued",
      editable: false,
      filterable: true,
    },
  ],
};

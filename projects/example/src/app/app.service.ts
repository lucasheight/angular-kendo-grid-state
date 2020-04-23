import { Injectable } from "@angular/core";
import { ODataStore } from '@lucasheight/odata-observable-store'
import { HttpClient } from '@angular/common/http';
export interface IProduct {
    ProductID: number;
    ProductName: string;
    SupplierID: number;
    CategoryID: number;
    QuantityPerUnit: string;
    UnitPrice: number;
    UnitsInStock: number;
    UnitsOnOrder: number;
    ReorderLevel: number;
    Discontinued: boolean;
}
@Injectable({providedIn:"root"})
export class AppService extends ODataStore<IProduct> {
    baseUrl: string = "https://odatasampleservices.azurewebsites.net/V4/Northwind/Northwind.svc/Products";

    constructor(protected http: HttpClient) {
        super(http);
    }

}
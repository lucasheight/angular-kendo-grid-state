import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { GridModule } from "@progress/kendo-angular-grid";
import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { GridStateDirective } from "./app.directive.grid";

@NgModule({
  declarations: [AppComponent, GridStateDirective],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    GridModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

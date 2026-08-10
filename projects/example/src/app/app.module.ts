import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { GridModule } from "@progress/kendo-angular-grid";
import { AppComponent } from "./app.component";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { CommonModule } from "@angular/common";
import {
  APP_STORAGE,
  GridStateModule,
} from "projects/kendo-grid-state/src/public-api";
import { GridDirectiveComponent } from "./grid.directive.component";

@NgModule({
  //providers: [{ provide: APP_STORAGE, useFactory: () => localStorage }],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    GridModule,
    GridStateModule,
    AppComponent,
    GridDirectiveComponent,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}

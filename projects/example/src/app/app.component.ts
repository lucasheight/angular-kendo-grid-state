import { Component, ViewEncapsulation } from "@angular/core";
import { GridDirectiveComponent } from "./grid.directive.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  encapsulation: ViewEncapsulation.Emulated,
  imports: [GridDirectiveComponent],
})
export class AppComponent {
  title: string = "example";
}

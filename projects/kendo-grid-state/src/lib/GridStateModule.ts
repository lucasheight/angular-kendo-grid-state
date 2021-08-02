import { NgModule } from "@angular/core";
import { GridStateDirective } from "./GridStateDirective";
import { GridStateSessionStorage, GRID_STATE_STORAGE } from "./GridStateStorage";

@NgModule({
  imports: [],
  declarations: [GridStateDirective],
  exports: [GridStateDirective],
  providers: [{ provide: GRID_STATE_STORAGE, useClass: GridStateSessionStorage }]
})
export class GridStateModule { }

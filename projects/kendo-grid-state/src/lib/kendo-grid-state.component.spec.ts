import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoGridStateComponent } from './kendo-grid-state.component';

describe('KendoGridStateComponent', () => {
  let component: KendoGridStateComponent;
  let fixture: ComponentFixture<KendoGridStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KendoGridStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KendoGridStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

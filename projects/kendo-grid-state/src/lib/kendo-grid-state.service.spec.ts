import { TestBed } from '@angular/core/testing';

import { KendoGridStateService } from './kendo-grid-state.service';

describe('KendoGridStateService', () => {
  let service: KendoGridStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KendoGridStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

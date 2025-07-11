import { TestBed } from '@angular/core/testing';

import { BigbagService } from './bigbag.service';

describe('BigbagService', () => {
  let service: BigbagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BigbagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

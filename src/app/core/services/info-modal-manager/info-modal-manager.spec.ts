import { TestBed } from '@angular/core/testing';

import { InfoModalManager } from './info-modal-manager';

describe('InfoModalManager', () => {
  let service: InfoModalManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoModalManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

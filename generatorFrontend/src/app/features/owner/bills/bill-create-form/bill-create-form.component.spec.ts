import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BillCreateFormComponent } from './bill-create-form.component';
import { AuthService } from '../../../../../core/auth/auth.service';
import { Store } from '@ngrx/store';
import { I18nService } from '../../../../../core/services/i18n.service';

jest.mock('@ngrx/entity', () => ({
  createEntityAdapter: () => ({
    getInitialState: (extra: any = {}) => extra,
    setAll: (_entities: unknown, state: unknown) => state,
    upsertOne: (_entity: unknown, state: unknown) => state
  })
}));

describe('BillCreateFormComponent', () => {
  let fixture: ComponentFixture<BillCreateFormComponent>;
  let component: BillCreateFormComponent;
  const storeDispatch = jest.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillCreateFormComponent],
      providers: [
        provideRouter([]),
        { provide: Store, useValue: { dispatch: storeDispatch, select: jest.fn().mockReturnValue(of([])) } },
        { provide: AuthService, useValue: { getOwnerIdOrThrow: () => 'owner-001' } },
        {
          provide: I18nService,
          useValue: {
            t: (key: string) => key,
            currentLang: () => 'en',
            ready: () => true,
            setLanguage: jest.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BillCreateFormComponent);
    component = fixture.componentInstance;
  });

  it('prevents submission when form invalid', () => {
    component.submit();
    expect(storeDispatch).not.toHaveBeenCalled();
  });

  it('dispatches create bill when form valid', () => {
    component.form.setValue({
      customerId: 'cust-1',
      period: '2025-04',
      meterReadingKwh: 100,
      ratePerKwh: 0.25,
      fixedCharge: 15,
      dueDate: '2025-05-05',
      notes: ''
    });
    component.submit();
    expect(storeDispatch).toHaveBeenCalled();
  });
});


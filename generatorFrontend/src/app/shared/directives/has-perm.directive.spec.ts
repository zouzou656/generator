import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HasPermDirective } from './has-perm.directive';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  template: `<div *hasPerm="['BILL_WRITE']">Allowed</div>`,
  standalone: true,
  imports: [HasPermDirective]
})
class TestHostComponent {}

describe('HasPermDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  const authMock = {
    hasPermission: jest.fn(),
    session: jest.fn().mockReturnValue(null)
  } as unknown as AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: AuthService, useValue: authMock }]
    });
    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('renders content when permission granted', () => {
    (authMock.hasPermission as jest.Mock).mockReturnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Allowed');
  });

  it('hides content when permission missing', () => {
    (authMock.hasPermission as jest.Mock).mockReturnValue(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});






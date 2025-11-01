import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HasRoleDirective } from './has-role.directive';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  template: `<div *hasRole="'ADMIN'">Role content</div>`,
  standalone: true,
  imports: [HasRoleDirective]
})
class HostComponent {}

describe('HasRoleDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  const authMock = {
    hasRole: jest.fn(),
    session: jest.fn().mockReturnValue(null)
  } as unknown as AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: AuthService, useValue: authMock }]
    });
    fixture = TestBed.createComponent(HostComponent);
  });

  it('shows content when role matches', () => {
    (authMock.hasRole as jest.Mock).mockReturnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Role content');
  });

  it('hides content when role mismatched', () => {
    (authMock.hasRole as jest.Mock).mockReturnValue(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});






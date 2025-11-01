import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/models/domain.models';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective {
  private readonly auth = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly vcr = inject(ViewContainerRef);
  private requiredRoles: UserRole[] = [];
  private isVisible = false;

  constructor() {
    effect(() => {
      const session = this.auth.session();
      this.updateView();
    });
  }

  @Input({ required: true })
  set hasRole(role: UserRole | UserRole[]) {
    this.requiredRoles = Array.isArray(role) ? role : [role];
    this.updateView();
  }

  private updateView(): void {
    if (!this.requiredRoles.length) {
      this.show();
      return;
    }
    const allowed = this.auth.hasRole(this.requiredRoles);
    allowed ? this.show() : this.hide();
  }

  private show(): void {
    if (!this.isVisible) {
      this.vcr.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    }
  }

  private hide(): void {
    if (this.isVisible) {
      this.vcr.clear();
      this.isVisible = false;
    }
  }
}






import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { PermissionMode } from '../../core/auth/auth.models';
import { AuthService } from '../../core/auth/auth.service';
import { Permission } from '../../core/models/domain.models';

@Directive({
  selector: '[hasPerm]',
  standalone: true
})
export class HasPermDirective {
  private readonly auth = inject(AuthService);
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);

  private requiredPerms: Permission[] = [];
  private mode: PermissionMode = 'allOf';
  private visible = false;

  constructor() {
    effect(() => {
      this.applyVisibility();
    });
  }

  @Input({ required: true })
  set hasPerm(perms: Permission[] | Permission) {
    this.requiredPerms = Array.isArray(perms) ? perms : [perms];
    this.applyVisibility();
  }

  @Input()
  set hasPermMode(mode: PermissionMode) {
    this.mode = mode ?? 'allOf';
    this.applyVisibility();
  }

  private applyVisibility(): void {
    if (!this.requiredPerms.length) {
      this.show();
      return;
    }
    const allowed = this.auth.hasPermission(this.requiredPerms, this.mode);
    allowed ? this.show() : this.hide();
  }

  private show(): void {
    if (!this.visible) {
      this.vcr.createEmbeddedView(this.tpl);
      this.visible = true;
    }
  }

  private hide(): void {
    if (this.visible) {
      this.vcr.clear();
      this.visible = false;
    }
  }
}






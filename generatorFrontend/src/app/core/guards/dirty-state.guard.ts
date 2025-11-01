import { CanDeactivateFn } from '@angular/router';

export interface DirtyComponent {
  hasDirtyState(): boolean;
  confirmDiscard?(): Promise<boolean> | boolean;
}

export const dirtyStateGuard: CanDeactivateFn<DirtyComponent> = async (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  if (!component?.hasDirtyState?.()) {
    return true;
  }

  if (component.confirmDiscard) {
    return await component.confirmDiscard();
  }

  if (typeof window === 'undefined') {
    return true;
  }

  return window.confirm('You have unsaved changes. Leave this page?');
};






import { Permission, UserRole } from '../models/domain.models';

export interface LoginFormValue {
  email: string;
  password: string;
  role: UserRole;
  remember: boolean;
}

export type PermissionMode = 'allOf' | 'anyOf';

export interface PermissionRequirement {
  perms: Permission[];
  mode?: PermissionMode;
}






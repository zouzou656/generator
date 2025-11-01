import { UserRole } from '../../../core/models/domain.models';

export function loginRedirectForRole(role: UserRole): string {
  return role === 'ADMIN' ? '/admin/requests' : '/owner/dashboard';
}






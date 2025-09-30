import { CanActivateFn } from '@angular/router';
import { canAccess } from './can-access';

export const checkDefaultPasswordGuard: CanActivateFn = async (route, state) => {
  return await canAccess();
};

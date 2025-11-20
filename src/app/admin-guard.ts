import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth';
import { Router } from '@angular/router';


export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.getUser();
  if (user && user.role === 'admin') return true;

  return router.createUrlTree(['/']);
};

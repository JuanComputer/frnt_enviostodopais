import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../storage.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const storage = inject(StorageService);
  const router  = inject(Router);
  const user    = storage.getUser();

  if (!user?.token) {
    router.navigate(['/auth']);
    return false;
  }

  const role = user.role || '';
  const url  = state.url;

  // Rutas admin — solo Admin Sede y Admin General
  if (url.startsWith('/admin')) {
    if (role === 'Administrador General' || role === 'Administrador de Sede')
      return true;
    router.navigate(['/']);
    return false;
  }

  // Crear envío — solo Operador
  if (url.startsWith('/crear-envio')) {
    if (role === 'Operador') return true;
    router.navigate(['/']);
    return false;
  }

  // Lista envíos — Operador, Admin Sede, Admin General
  if (url.startsWith('/lista-envios')) {
    if (role === 'Operador' || role === 'Administrador de Sede' || role === 'Administrador General')
      return true;
    router.navigate(['/']);
    return false;
  }

  // Mis envíos — solo Cliente
  if (url.startsWith('/mis-envios')) {
    if (role === 'Cliente') return true;
    router.navigate(['/']);
    return false;
  }

  return true;
};

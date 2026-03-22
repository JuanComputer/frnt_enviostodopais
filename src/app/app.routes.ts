import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  // ── Públicas
  { path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'auth', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'ubicanos', loadComponent: () => import('./components/locate-us/locate-us.component').then(m => m.LocateUsComponent) },
  { path: 'cotizador', loadComponent: () => import('./components/cotizador/cotizador.component').then(m => m.CotizadorComponent) },
  { path: 'noticias', loadComponent: () => import('./components/noticias/noticias.component').then(m => m.NoticiasComponent) },
  { path: 'contactanos', loadComponent: () => import('./components/contact-us/contact-us.component').then(m => m.ContactUsComponent) },

  // ── Operador
  { path: 'crear-envio', canActivate: [AuthGuard], loadComponent: () => import('./components/envios/crear-envio/crear-envio.component').then(m => m.CrearEnvioComponent) },

  // ── Staff (Operador + Admin Sede + Admin General)
  { path: 'lista-envios', canActivate: [AuthGuard], loadComponent: () => import('./components/shipment-list/shipment-list.component').then(m => m.ShipmentListComponent) },

  // ── Cliente
  { path: 'mis-envios', canActivate: [AuthGuard], loadComponent: () => import('./components/shipment-list/shipment-list.component').then(m => m.ShipmentListComponent) },

  // ── Admin (Sede + General)
  { path: 'admin/usuarios', canActivate: [AuthGuard], loadComponent: () => import('./components/admin/usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
  { path: 'admin/sedes', canActivate: [AuthGuard], loadComponent: () => import('./components/admin/sedes/admin-sedes.component').then(m => m.AdminSedesComponent) },
  { path: 'admin/reportes', canActivate: [AuthGuard], loadComponent: () => import('./components/admin/reportes/admin-reportes.component').then(m => m.AdminReportesComponent) },

  // Fallback
  { path: '**', redirectTo: '' }
];

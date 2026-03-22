import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  userName        = '';
  userRole        = '';
  isAuthenticated = false;
  showUserMenu    = false;
  showAdminMenu   = false;
  isScrolled      = false;

  private sub: Subscription | undefined;

  constructor(
    private storage: StorageService,
    public  router:  Router,
    private auth:    AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.sub = this.storage.watchStorage().subscribe(() => this.loadUserInfo());
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  @HostListener('window:scroll')
  onScroll(): void { this.isScrolled = window.scrollY > 20; }

  @HostListener('document:click', ['$event'])
  onClickOutside(e: MouseEvent): void {
    const userMenu  = document.querySelector('.user-menu')  as HTMLElement;
    const adminMenu = document.querySelector('.dropdown-parent') as HTMLElement;
    if (this.showUserMenu  && userMenu  && !userMenu.contains(e.target as Node))
      this.showUserMenu  = false;
    if (this.showAdminMenu && adminMenu && !adminMenu.contains(e.target as Node))
      this.showAdminMenu = false;
  }

  loadUserInfo(): void {
    const user = this.storage.getUser();
    this.isAuthenticated = !!user;
    if (user) {
      this.userRole = user.role || '';
      this.userName = user.correo || '';
    } else {
      this.userRole = '';
      this.userName = '';
    }
  }

  // ── Getters de rol
  get isAdminGeneral(): boolean { return this.userRole === 'Administrador General'; }
  get isAdminSede():    boolean { return this.userRole === 'Administrador de Sede'; }
  get isOperador():     boolean { return this.userRole === 'Operador'; }
  get isCliente():      boolean { return this.userRole === 'Cliente'; }
  get isStaff():        boolean {
    return this.isAdminGeneral || this.isAdminSede || this.isOperador;
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  get roleLabel(): string {
    const map: Record<string, string> = {
      'Administrador General': 'Admin General',
      'Administrador de Sede': 'Admin Sede',
      'Operador':              'Operador',
      'Cliente':               'Cliente',
    };
    return map[this.userRole] || this.userRole;
  }

  get roleBadgeClass(): string {
    const map: Record<string, string> = {
      'Administrador General': 'badge-admin-general',
      'Administrador de Sede': 'badge-admin-sede',
      'Operador':              'badge-operador',
      'Cliente':               'badge-cliente',
    };
    return map[this.userRole] || 'badge-cliente';
  }

  toggleUserMenu():  void { this.showUserMenu  = !this.showUserMenu;  this.showAdminMenu = false; }
  toggleAdminMenu(): void { this.showAdminMenu = !this.showAdminMenu; this.showUserMenu  = false; }

  logout(): void {
    this.storage.clear();
    this.isAuthenticated = false;
    this.userName = ''; this.userRole = '';
    this.showUserMenu = false; this.showAdminMenu = false;
    window.location.href = '/';
  }
}

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
  userName: string = '';
  userRole: string = '';
  isAuthenticated: boolean = false;
  showUserMenu: boolean = false;
  isScrolled: boolean = false;

  private storageSubscription: Subscription | undefined;

  constructor(
    private storage: StorageService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.storageSubscription = this.storage.watchStorage().subscribe(() => {
      this.loadUserInfo();
    });
  }

  ngOnDestroy(): void {
    this.storageSubscription?.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const userMenu = document.querySelector('.user-menu') as HTMLElement;
    if (this.showUserMenu && userMenu && !userMenu.contains(event.target as Node)) {
      this.showUserMenu = false;
    }
  }

  loadUserInfo(): void {
    const user = this.storage.getUser();
    this.isAuthenticated = !!user;
    if (user) {
      this.userRole = user.role || '';
      this.userName = user.name || user.correo || 'Usuario';
    } else {
      this.userName = '';
      this.userRole = '';
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.storage.clear();
    this.isAuthenticated = false;
    this.userName = '';
    this.userRole = '';
    this.showUserMenu = false;
    this.router.navigate(['/auth']);
  }
}

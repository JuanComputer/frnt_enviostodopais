import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {


  private storageChange = new Subject<void>();

  watchStorage(): Subject<void> {
    return this.storageChange;
  }

  getItem(key: string): string | null {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  }

  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }

  getUser(): any {
    const user = this.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setUser(user: any): void {
    this.setItem('user', JSON.stringify(user));
  }


  
  clear() {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      this.storageChange.next();
    }
  }
  
}
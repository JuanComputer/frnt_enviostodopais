// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, map } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private base = 'http://localhost:8080/api'; // ajusta si tu backend es diferente

//   constructor(private http: HttpClient) {}

//   login(correo: string, password: string): Observable<any> {
//     return this.http.post<Response>(`${this.base}/auth/login`, { correo, password })
//       .pipe(map((res: any) => {
//         if (res?.data?.token) {
//           localStorage.setItem('user', JSON.stringify({
//             id: res.data.id,
//             correo: res.data.email,
//             role: res.data.role,
//             token: res.data.token
//           }));
//           //localStorage.setItem('token', res.data.token);
//           //localStorage.setItem('role', res.data.role);
//         }
//         return res;
//       }));
//   }

//   logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('role');
//   }

//   getToken(): string | null {
//     return localStorage.getItem('token');
//   }

//   getRole(): string | null {
//     return localStorage.getItem('role');
//   }

//   isLogged(): boolean {
//     return !!this.getToken();
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'https://back-enviostodopais.onrender.com/api'; // ajusta si tu backend es diferente

  constructor(private http: HttpClient) {}

  login(correo: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.base}/auth/login`, { correo, password })
      .pipe(map((res: any) => {
        if (res?.data?.token) {
          localStorage.setItem('user', JSON.stringify({
            id: res.data.id,
            correo: res.data.email,
            role: res.data.role,
            token: res.data.token
          }));
        }
        return res;
      }));
  }

  logout() {
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null; // evita crash en SSR
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token || null;
  }

  getRole(): string | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || null;
  }

  isLogged(): boolean {
    return !!this.getToken();
  }

  resetPassword(correo: string, dni: string, nuevaPassword: string): Observable<any> {
    return this.http.post<any>(`${this.base}/auth/reset-password`, { correo, dni, nuevaPassword });
  }

  
  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${this.base}/usuarios/perfil`, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    }).pipe(map((res: any) => res.data));
  }

  // Método para decodificar el token JWT (cliente-side, sin verificar firma)
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload); // Decodifica la parte base64 del payload
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Error decoding token:', e);
      return {};
    }
  }
}
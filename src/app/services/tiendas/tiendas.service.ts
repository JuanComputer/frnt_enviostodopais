import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tienda } from '../../shared/models/tienda.model';
import { Observable, throwError } from 'rxjs';
import { catchError, take, timeout } from 'rxjs/operators';
import { ResponseDto } from '../../shared/models/response-dto';

@Injectable({ providedIn: 'root' })
export class TiendasService {
  private base = 'https://back-enviostodopais.onrender.com/api/tiendas';

  constructor(private http: HttpClient) {}

  listar(nombre?: string): Observable<ResponseDto<Tienda[]>> {
    const q = nombre ? `?nombre=${encodeURIComponent(nombre)}` : '';
    return this.http.get<ResponseDto<Tienda[]>>(`${this.base}/listar${q}`).pipe(
      timeout(5000), // Timeout de 5 segundos
      take(1), // Completa la suscripción después de la primera emisión
      catchError(error => {
        console.error('Error al cargar tiendas:', error);
        return throwError(() => new Error('No se pudieron cargar las tiendas'));
      })
    );
  }

  crear(payload: any): Observable<ResponseDto<Tienda>> {
    return this.http.post<ResponseDto<Tienda>>(`${this.base}/crear`, payload).pipe(
      take(1),
      catchError(error => {
        console.error('Error al crear tienda:', error);
        return throwError(() => new Error('No se pudo crear la tienda'));
      })
    );
  }

  editar(id: string, payload: any): Observable<ResponseDto<Tienda>> {
    return this.http.put<ResponseDto<Tienda>>(`${this.base}/${id}/editar`, payload).pipe(
      take(1),
      catchError(error => {
        console.error('Error al editar tienda:', error);
        return throwError(() => new Error('No se pudo editar la tienda'));
      })
    );
  }

  eliminar(id: string): Observable<ResponseDto<string>> {
    return this.http.delete<ResponseDto<string>>(`${this.base}/${id}`).pipe(
      take(1),
      catchError(error => {
        console.error('Error al eliminar tienda:', error);
        return throwError(() => new Error('No se pudo eliminar la tienda'));
      })
    );
  }
}
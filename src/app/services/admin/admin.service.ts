import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseU = `${environment.api}/api/usuarios`;
  private baseT = `${environment.api}/api/tiendas`;
  private baseR = `${environment.api}/api/reportes`;

  constructor(private http: HttpClient) {}

  listarUsuarios(filtros?: { rol?: string; activo?: boolean }): Observable<any> {
    let params = new HttpParams();
    if (filtros?.rol !== undefined)    params = params.set('rol', filtros.rol);
    if (filtros?.activo !== undefined) params = params.set('activo', String(filtros.activo));
    return this.http.get<any>(`${this.baseU}/listar`, { params });
  }

  crearUsuario(dto: any):              Observable<any> { return this.http.post<any>(`${this.baseU}/crear`, dto); }
  editarUsuario(id: string, dto: any): Observable<any> { return this.http.put<any>(`${this.baseU}/${id}/editar`, dto); }
  toggleActivo(id: string):            Observable<any> { return this.http.put<any>(`${this.baseU}/${id}/toggle-activo`, {}); }
  estadisticasUsuarios():              Observable<any> { return this.http.get<any>(`${this.baseU}/estadisticas`); }

  listarSedes():                       Observable<any> { return this.http.get<any>(`${this.baseT}/listar`); }
  crearSede(dto: any):                 Observable<any> { return this.http.post<any>(`${this.baseT}/crear`, dto); }
  editarSede(id: string, dto: any):    Observable<any> { return this.http.put<any>(`${this.baseT}/${id}/editar`, dto); }
  eliminarSede(id: string):            Observable<any> { return this.http.delete<any>(`${this.baseT}/${id}`); }

  resumen():                           Observable<any> { return this.http.get<any>(`${this.baseR}/resumen`); }
}

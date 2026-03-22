import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseDto } from '../shared/models/response-dto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CotizadorService {
  private base = `${environment.api}/api/cotizador`;

  constructor(private http: HttpClient) {}

  calcular(payload: any): Observable<ResponseDto<any>> {
    return this.http.post<ResponseDto<any>>(`${this.base}/calcular`, payload);
  }

  // (opcional) podrías traer lista de tiendas
  obtenerTiendas(): Observable<ResponseDto<any>> {
    return this.http.get<ResponseDto<any>>('${environment.api}/api/tiendas/listar');
  }
}

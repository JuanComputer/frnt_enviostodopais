import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Envio } from '../../shared/models/envio.model';
import { ResponseDto } from '../../shared/models/response-dto';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnviosService {
  private base = `${environment.api}/api/envios`;

  constructor(private http: HttpClient) {}

  crear(payload: any): Observable<ResponseDto<Envio>> {
    return this.http.post<ResponseDto<Envio>>(`${this.base}/crear`, payload);
  }

  listar(filters?: { estado?: string; dniReceptor?: string }): Observable<ResponseDto<Envio[]>> {
    let params = new HttpParams();
    if (filters?.estado)      params = params.set('estado', filters.estado);
    if (filters?.dniReceptor) params = params.set('dniReceptor', filters.dniReceptor);
    return this.http.get<ResponseDto<Envio[]>>(`${this.base}/listar`, { params });
  }

  misEnvios(): Observable<ResponseDto<Envio[]>> {
    return this.http.get<ResponseDto<Envio[]>>(`${this.base}/mis-envios`);
  }

  obtenerPorTracking(codigo: string): Observable<ResponseDto<Envio>> {
    return this.http.get<ResponseDto<Envio>>(`${this.base}/tracking/${codigo}`);
  }

  obtenerEstadosValidos(id: string): Observable<ResponseDto<string[]>> {
    return this.http.get<ResponseDto<string[]>>(`${this.base}/${id}/estados-validos`);
  }

  cambiarEstado(id: string, payload: { nuevoEstado: string; nota?: string }): Observable<ResponseDto<Envio>> {
    return this.http.put<ResponseDto<Envio>>(`${this.base}/${id}/estado`, payload);
  }

  generarBoleta(id: string): Observable<ResponseDto<{ base64: string; filename: string; mimeType: string }>> {
    return this.http.get<ResponseDto<any>>(`${this.base}/${id}/boleta`);
  }
}
